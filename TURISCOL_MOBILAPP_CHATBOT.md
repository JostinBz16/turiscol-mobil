# TURISCOL MOBILAPP — Integración del Chatbot

Guía para el equipo de la **app móvil (Ionic)**. Documenta cómo conectar la interfaz de chat con el microservicio `chatbot-service`.

---

## 1. Resumen

El chatbot es un asistente virtual de turismo que responde en lenguaje natural sobre ofertas, destinos, precios, festividades y reseñas. Usa un LLM con **function calling** que consulta el backend automáticamente.

Dos formas de comunicación:

| Modo                | Cuándo usar                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| **REST** (POST)     | Enviar un mensaje y recibir la respuesta completa. Simple, recomendado para el MVP. |
| **WebSocket STOMP** | Chat en tiempo real con conexión persistente. Mejor UX pero más complejo.           |

---

## 2. Configuración de URLs

| Entorno    | REST (Gateway)                      | WebSocket (recomendado)           | WebSocket (alternativa)        |
| ---------- | ----------------------------------- | --------------------------------- | ------------------------------ |
| **Local**  | `http://localhost:8080/api/v1/chat` | `ws://localhost:8809/ws/chat`     | `ws://localhost:8080/ws/chat`  |
| **Docker** | `http://localhost:8080/api/v1/chat` | `ws://localhost:8809/ws/chat`     | `ws://localhost:8080/ws/chat`  |

> **✅ Estado: resuelto.** El gateway ya enruta correctamente el chatbot:
>
> - **REST** (`/api/v1/chat/**` → `StripPrefix=0`): antes daba 404 por un `StripPrefix` incorrecto; ya está corregido y verificado.
> - **WebSocket**: se agregó la ruta `chatbot-websocket` (`/ws/chat/**`) **antes** de la ruta de notificaciones `/ws/**`, por lo que el chat también se puede conectar **vía gateway** (`ws://localhost:8080/ws/chat`). La conexión **directa al puerto `8809`** sigue siendo la opción más simple y probada.

---

## 3. Endpoints REST

Base (gateway): `http://localhost:8080/api/v1/chat`

### 3.1 POST `/` — Enviar mensaje

**Request:**

```json
{
  "message": "¿Qué hay para hacer en Medellín este fin de semana?",
  "conversationId": "conv_abc123"
}
```

| Campo            | Tipo   | Obligatorio | Descripción                                                                                                          |
| ---------------- | ------ | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `message`        | String | ✅          | Texto del usuario                                                                                                    |
| `conversationId` | String | ❌          | Si se omite o es `null`, crea una conversación nueva. Si se envía y pertenece al usuario, continúa esa conversación. |

**Response (200 OK):**

```json
{
  "conversationId": "conv_abc123",
  "message": "¡Encontré 3 alojamientos en Santa Marta por menos de $150.000! 🌴 1. Hostal Caribe - $45.000/noche ⭐4.5 ...",
  "toolCalls": [
    {
      "toolName": "search_offers",
      "arguments": "{\"cityId\":5,\"offerType\":\"ACCOMMODATION\",\"maxPrice\":150000}",
      "result": "[...]"
    }
  ]
}
```

| Campo            | Tipo             | Descripción                                                                      |
| ---------------- | ---------------- | -------------------------------------------------------------------------------- |
| `conversationId` | String           | ID de la conversación (nueva o existente)                                        |
| `message`        | String           | Respuesta del asistente                                                          |
| `toolCalls`      | Array (nullable) | Tools que ejecutó el LLM internamente. **No es necesario mostrarlo al usuario.** |

**Headers requeridos:** ninguno obligatorio. El gateway agrega `X-User-Id` automáticamente del token JWT. Si el usuario no está logueado, se asigna `anonymous`.

### 3.2 GET `/conversations` — Listar conversaciones

**Response (200 OK):** Array de conversaciones del usuario, ordenadas por `updatedAt` descendente.

```json
[
  {
    "id": "conv_abc123",
    "userId": "uuid-del-usuario",
    "title": "Buscando hotel en Santa Marta",
    "messages": [ ... ],
    "createdAt": "2026-08-01T10:30:00Z",
    "updatedAt": "2026-08-01T10:45:00Z",
    "expiresAt": "2026-08-31T10:30:00Z",
    "metadata": null
  }
]
```

**Uso típico:** pantalla de historial de chats — mostrar `title` y `updatedAt`.

### 3.3 GET `/conversations/{id}` — Detalle de conversación

Devuelve una conversación con todo su historial de mensajes. **404** si no existe o no pertenece al usuario.

**Estructura de `messages[]`:**

```json
"messages": [
  { "role": "user", "content": "Hola, busco hotel en Santa Marta", "timestamp": "..." },
  { "role": "assistant", "content": "¡Claro! Encontré 3 opciones...", "timestamp": "...", "toolCalls": null }
]
```

| Campo       | Tipo             | Descripción                                       |
| ----------- | ---------------- | ------------------------------------------------- |
| `role`      | String           | `user` \| `assistant` \| `tool`                   |
| `content`   | String           | Texto del mensaje                                 |
| `timestamp` | String (ISO)     | Fecha del mensaje                                 |
| `toolCalls` | Array (nullable) | Solo en respuestas del asistente que usaron tools |

### 3.4 DELETE `/conversations/{id}` — Eliminar conversación

**Response:** `204 No Content`. Solo elimina si la conversación pertenece al usuario.

---

## 4. WebSocket STOMP (Chat en tiempo real)

### 4.1 Configuración

| Propiedad              | Valor                       |
| ---------------------- | --------------------------- |
| Endpoint de conexión   | `ws://<host>:8809/ws/chat` (directo, recomendado) o `ws://<host>:8080/ws/chat` (vía gateway) |
| Prefijo de envío (app) | `/app`                      |
| Destino de envío       | `/app/chat`                 |
| Destino de suscripción | `/user/{userId}/queue/chat` |
| Prefijo broker         | `/topic`, `/queue`          |

### 4.2 Flujo

1. **Conectar** al endpoint STOMP (`ws://<host>:8809/ws/chat` directo o `ws://<host>:8080/ws/chat` vía gateway)
2. **Suscribirse** a `/user/{userId}/queue/chat` (tu cola privada)
3. **Enviar** `ChatRequest` (misma estructura que REST) a `/app/chat`
4. **Recibir** la respuesta en la cola suscrita

> El `userId` para la cola lo resuelve el servidor a partir del `Principal` de la sesión STOMP (derivado del JWT). Conectando directo al `8809` el gateway no está involucrado.

### 4.3 Ejemplo Angular (Ionic + `@stomp/stompjs`)

```typescript
// chat.service.ts
import { Client, Message } from "@stomp/stompjs";
import * as SockJS from "sockjs-client";

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ToolCall {
  toolName: string;
  arguments: string;
  result: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  toolCalls?: ToolCall[];
}

@Injectable({ providedIn: "root" })
export class ChatService {
  private client: Client;
  private WS_URL = "ws://localhost:8809/ws/chat";

  connect(userId: string, onMessage: (resp: ChatResponse) => void): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8809/ws/chat"),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      this.client.subscribe(`/user/${userId}/queue/chat`, (msg: Message) => {
        const resp: ChatResponse = JSON.parse(msg.body);
        onMessage(resp);
      });
      console.log("Conectado al chat WebSocket");
    };

    this.client.activate();
  }

  sendMessage(message: string, conversationId?: string): void {
    const payload: ChatRequest = { message, conversationId };
    this.client.publish({ destination: "/app/chat", body: JSON.stringify(payload) });
  }

  disconnect(): void {
    this.client?.deactivate();
  }
}
```

### 4.4 Ejemplo REST (más simple, recomendado para MVP)

```typescript
// chat-rest.service.ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

const API_URL = "http://localhost:8080/api/v1/chat";

@Injectable({ providedIn: "root" })
export class ChatRestService {
  constructor(private http: HttpClient) {}

  sendMessage(message: string, conversationId?: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${API_URL}`, { message, conversationId });
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${API_URL}/conversations`);
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${API_URL}/conversations/${id}`);
  }

  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/conversations/${id}`);
  }
}
```

---

## 5. Componente de UI sugerido (Ionic)

```typescript
// chat.page.ts (ejemplo de flujo completo)
export class ChatPage {
  messages: { role: "user" | "assistant"; text: string }[] = [];
  input = "";
  currentConversationId?: string;

  constructor(private chatRest: ChatRestService) {}

  async send() {
    const text = this.input.trim();
    if (!text) return;

    this.messages.push({ role: "user", text });
    this.input = "";

    this.chatRest.sendMessage(text, this.currentConversationId).subscribe({
      next: (resp) => {
        this.currentConversationId = resp.conversationId;
        this.messages.push({ role: "assistant", text: resp.message });
      },
      error: () => {
        this.messages.push({ role: "assistant", text: "Lo siento, no pude procesar tu consulta. Intenta de nuevo." });
      },
    });
  }

  ionViewWillEnter() {
    // Cargar historial si el usuario vuelve a la pantalla
    this.currentConversationId = history.state.conversationId;
  }
}
```

---

## 6. Casos de uso soportados (lo que el chatbot puede responder)

| Pregunta del usuario                      | Tool usada internamente                            |
| ----------------------------------------- | -------------------------------------------------- |
| "¿Qué hay en Medellín?"                   | `search_offers`, `get_offers_by_city`              |
| "¿Cuánto cuesta dormir en Santa Marta?"   | `search_prices`, `get_prices_by_city`              |
| "¿Qué festividades hay este mes?"         | `get_festivities`, `get_upcoming_festivities`      |
| "¿Qué destinos hay en Boyacá?"            | `get_destinations`, `get_cities`                   |
| "¿Qué opinan de este hotel?"              | `get_reviews`, `get_rating_summary`                |
| "¿Cuáles son los destinos más populares?" | `get_featured_destinations`, `get_featured_cities` |

**NO soporta** (fuera de alcance): reservas del usuario, favoritos, pagos. Redirige al soporte.

---

## 7. Manejo de errores

| Código  | Causa                                             | Acción del front                                                                        |
| ------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `404`   | Ruta no encontrada                                | Verificar token y URL `/api/v1/chat/**` (routing del gateway ya corregido)              |
| `429`   | Rate limit de Groq / LLM sobrecargado             | Reintentar en unos segundos (el backend responde `200` con mensaje amigable)            |
| `500`   | Error del LLM o del microservicio interno         | Mostrar mensaje genérico de error                                                        |
| Timeout | Respuesta tardía del LLM                          | Mostrar spinner mientras dure la petición                                                |

---

## 8. Checklist de implementación

- [ ] Pantalla de chat con lista de mensajes (user/assistant)
- [ ] Campo de entrada de texto + botón enviar
- [ ] `POST /api/v1/chat` para enviar mensajes
- [ ] Guardar `conversationId` de la respuesta para continuar el hilo
- [ ] Pantalla de historial (`GET /api/v1/chat/conversations`)
- [ ] Cargar conversación existente (`GET /api/v1/chat/conversations/{id}`)
- [ ] Opción de eliminar conversación (`DELETE /api/v1/chat/conversations/{id}`)
- [ ] (Opcional) WebSocket STOMP para tiempo real
- [ ] Indicador de "escribiendo…" mientras carga
- [ ] Manejo de errores y off-line
