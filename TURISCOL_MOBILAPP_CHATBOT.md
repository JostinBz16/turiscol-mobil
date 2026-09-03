# TURISCOL MOBILAPP — Integración del Chatbot

Guía para el equipo de la **app móvil (Ionic)**. Documenta cómo conectar la interfaz de chat con el microservicio `chatbot-service`.

---

## 1. Resumen

El chatbot es un asistente virtual de turismo que responde en lenguaje natural sobre ofertas, destinos, precios, festividades y reseñas. Usa un LLM con **function calling** que consulta el backend automáticamente.

**Modelo de chat único:** cada usuario tiene una **sola conversación activa**. El front envía solo `message` (no `conversationId`) y el backend reutiliza automáticamente el hilo del usuario. Para empezar una conversación nueva se llama a `POST /api/v1/chat/reset` (botón "Nuevo chat"), que archiva la anterior y crea una vacía. **No hay pantalla de historial de conversaciones.**

Dos formas de comunicación:

| Modo                | Cuándo usar                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| **REST** (POST)     | Enviar un mensaje y recibir la respuesta completa. Simple, recomendado para el MVP. |
| **WebSocket STOMP** | Chat en tiempo real con conexión persistente. Mejor UX pero más complejo.           |

---

## 2. Configuración de URLs

| Entorno    | REST (Gateway)                      | WebSocket (recomendado)       | WebSocket (alternativa)       |
| ---------- | ----------------------------------- | ----------------------------- | ----------------------------- |
| **Local**  | `http://localhost:8080/api/v1/chat` | `ws://localhost:8809/ws/chat` | `ws://localhost:8080/ws/chat` |
| **Docker** | `http://localhost:8080/api/v1/chat` | `ws://localhost:8809/ws/chat` | `ws://localhost:8080/ws/chat` |

> **⚠️ WebSocket vía gateway (8080): NO recomendado.** Concretar al Puerto **8809 directo** es lo más fiable. Vía gateway el `chatbot-service` recibe el mensaje y envía la respuesta (log `Enviando respuesta WS al usuario ...`), pero con frecuencia la respuesta no llega de vuelta al front porque el proxy/STOMP no preserva la sesión `{sub}` y el header `Authorization` (además, los tokens vencen y el `StompAuthInterceptor` los rechaza con `Jwt expired`). **Para el chat usa REST (§4.4/§5), no WebSocket.**

> **✅ Estado: resuelto.** El gateway ya enruta correctamente el chatbot:
>
> - **REST** (`/api/v1/chat/**` → `StripPrefix=0`): antes daba 404 por un `StripPrefix` incorrecto; ya está corregido y verificado.
> - **WebSocket**: se agregó la ruta `chatbot-websocket` (`/ws/chat/**`) **antes** de la ruta de notificaciones `/ws/**`, por lo que el chat también se puede conectar **vía gateway** (`ws://localhost:8080/ws/chat`). La conexión **directa al puerto `8809`** sigue siendo la opción más simple y probada.
>
> > **⚠️ Autenticación en WebSocket:** desde que se aplicó el fix de la NPE (`NullPointerException` por `principal` nulo), el endpoint STOMP **requiere autenticación**. El cliente debe enviar el header `Authorization: Bearer <jwt>` en el frame `CONNECT` (igual que en el `notification-service`). El `userId` se deriva del JWT; una conexión sin token cae a `anonymous`.

---

## 3. Endpoints REST

Base (gateway): `http://localhost:8080/api/v1/chat`

### 3.1 POST `/` — Enviar mensaje

**Request:**

```json
{
  "message": "¿Qué hay para hacer en Medellín este fin de semana?"
}
```

| Campo     | Tipo   | Obligatorio | Descripción       |
| --------- | ------ | ----------- | ----------------- |
| `message` | String | ✅          | Texto del usuario |

> **`conversationId` ya no se envía:** el campo sigue existiendo en el DTO por retrocompatibilidad, pero el backend lo **ignora**. El front **no** necesita guardar ni reenviar un id para continuar el hilo: cada usuario tiene una **única conversación activa (ACTIVE)** y el backend la reutiliza automáticamente en cada `POST`.

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
| `conversationId` | String           | ID de la conversación activa (el mismo para todos los mensajes del chat actual)  |
| `message`        | String           | Respuesta del asistente                                                          |
| `toolCalls`      | Array (nullable) | Tools que ejecutó el LLM internamente. **No es necesario mostrarlo al usuario.** |

**Headers requeridos (REST):** el **gateway protege la ruta** y la app debe enviar `Authorization: Bearer <jwt>` (el mismo del login). Sin token el gateway responde `401`. El `userId` se deriva del `sub` del JWT.

### 3.2 POST `/reset` — Reiniciar / limpiar chat (NUEVO)

Crea una conversación nueva vacía. La conversación ACTIVE anterior se **archiva automáticamente** en el backend (se conserva en BD para auditoría pero no se usa).

**Request:** sin body (solo header `Authorization`).

**Response (200 OK):**

```json
{
  "conversationId": "conv_xyz999",
  "message": "Chat reiniciado"
}
```

**Uso típico:** botón "Nuevo chat" / "Limpiar conversación". El front debe:

1. Llamar a `POST /reset` (con `Authorization`).
2. Vaciar la lista local de mensajes.
3. Guardar el nuevo `conversationId` devuelto (para futuras referencias).

> **Importante:** al reset no hace falta borrar nada en el front; el backend archiva la conversación anterior y entrega una nueva vacía.

---

## 3.5 Cambios requeridos en el front (migración al chat único)

> **⚠️ LEE ESTO PRIMERO.** El backend dejó el modelo de **una sola conversación activa (ACTIVE)** por usuario. Si tu app aún usa el modelo viejo de "múltiples conversaciones", debes aplicar estas correcciones o el chat dejará de funcionar (los endpoints viejos dan 404).

### Qué hacer, paso a paso

| #   | Corrección en el front                                                                   | Antes (modelo viejo)                                         | Ahora (chat único)                                                                                           |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | **Dejar de enviar `conversationId`** en `POST /api/v1/chat`                              | Se enviaba el id para continuar el hilo                      | Enviar solo `{ "message": "..." }`. El backend reutiliza automáticamente la conversación ACTIVE del usuario. |
| 2   | **Eliminar la pantalla/lógica de historial** que usaba `GET /api/v1/chat/conversations`  | Listaba las conversaciones del usuario                       | **El endpoint ya NO existe** (404). Quitar esa pantalla o esa llamada.                                       |
| 3   | **Eliminar el cargue de conversaciones** que usaba `GET /api/v1/chat/conversations/{id}` | Recuperaba un hilo anterior                                  | **El endpoint ya NO existe** (404). Quitar esa llamada y cualquier `history.state.conversationId`.           |
| 4   | **Reemplazar "eliminar conversación" por "nuevo chat"**                                  | Botón que llamaba a `DELETE /api/v1/chat/conversations/{id}` | Botón **"Nuevo chat"** que llama a `POST /api/v1/chat/reset` (archiva la ACTIVE y crea una vacía).           |
| 5   | **No guardar ni gestionar `conversationId`** en el componente de chat                    | Se almacenaba el id y se reenviaba en cada mensaje           | `sendMessage(jwt, text)` sin id. El id de la respuesta es solo informativo.                                  |
| 6   | **Vaciar la lista local de mensajes** al resetear                                        | —                                                            | Tras `POST /reset` con éxito, hacer `messages = []`.                                                         |

### Cambios en el servicio (`chat-rest.service.ts`)

```typescript
// ❌ ELIMINAR estos métodos (ya no existen en el backend):
//   getConversations(jwt)                 → GET /conversations  (404)
//   getConversation(jwt, id)              → GET /conversations/{id} (404)
//   deleteConversation(jwt, id)           → borrado puntual interno (no para el usuario)

// ✅ MANTENER / AJUSTAR:
sendMessage(jwt: string, message: string): Observable<ChatResponse> {
  const headers = new HttpHeaders({ Authorization: `Bearer ${jwt}` });
  return this.http.post<ChatResponse>(`${API_URL}`, { message }, { headers }); // sin conversationId
}

// ✅ AGREGAR: nuevo chat
resetChat(jwt: string): Observable<ChatResponse> {
  const headers = new HttpHeaders({ Authorization: `Bearer ${jwt}` });
  return this.http.post<ChatResponse>(`${API_URL}/reset`, {}, { headers });
}
```

### Botón "Nuevo chat" en el componente

```typescript
async newChat() {
  const jwt = await this.auth.token();
  if (!jwt) return;
  this.chatRest.resetChat(jwt).subscribe({
    next: () => { this.messages = []; },   // vaciar el historial local
    error: () => {},                        // opcional: mensaje de error
  });
}
```

> **Nota:** el `conversationId` que devuelve el backend es **solo informativo** (por si quieres guardarlo para debug). No es necesario para que el chat continúe: el backend siempre usa la conversación ACTIVE del usuario.

---

## 4. WebSocket STOMP (Chat en tiempo real) — NO recomendado

> **⚠️ Aviso importante:** para el chat usa **REST (§4.4/§5)**, no WebSocket.
>
> - **REST** devuelve la respuesta directamente en el `POST` (simple, fiable, recomendado).
> - **WebSocket vía gateway (8080)** no es confiable: el `chatbot-service` recibe el mensaje y envía la respuesta (log `Enviando respuesta WS al usuario ...`) pero con frecuencia la respuesta **no llega de vuelta al front** (el proxy/STOMP no preserva la sesión `{sub}` ni el `Authorization`, y los tokens vencen → `Jwt expired`).
> - **WebSocket directo al 8809** funciona mejor, pero aun así exige que la suscripción apunte exactamente a `/user/{sub}/queue/chat` y que `@stomp/stompjs` reciba la ruta **completa** (no la sustituye automáticamente).

Solo se documenta WebSocket a continuación por completitud/historial.

### 4.1 Configuración

| Propiedad              | Valor                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Endpoint de conexión   | `ws://<host>:8809/ws/chat` (directo, recomendado) o `ws://<host>:8080/ws/chat` (vía gateway) |
| Header en `CONNECT`    | `Authorization: Bearer <jwt>` (obligatorio)                                                  |
| Prefijo de envío (app) | `/app`                                                                                       |
| Destino de envío       | `/app/chat`                                                                                  |
| Destino de suscripción | `/user/{userId}/queue/chat`                                                                  |
| Prefijo broker         | `/topic`, `/queue`                                                                           |

### 4.2 Flujo

1. **Conectar** al endpoint STOMP (`ws://<host>:8809/ws/chat` directo o `ws://<host>:8080/ws/chat` vía gateway), enviando `Authorization: Bearer <jwt>` en el frame `CONNECT`. Sin token la conexión se rechaza o se mapea a `anonymous`.
2. **Suscribirse** a `/user/{userId}/queue/chat` (tu cola privada). El `userId` es el `subject` del JWT.
3. **Enviar** `ChatRequest` (misma estructura que REST) a `/app/chat`
4. **Recibir** la respuesta en la cola suscrita

> El servidor valida el JWT en el `CONNECT` con Keycloak y lo usa como `Principal` de la sesión STOMP. El `userId` para la cola privada sale de ese `Principal`; no se debe confiar en un `userId` arbitrario que envíe el cliente. Conectando directo al `8809` el gateway no está involucrado, pero la autenticación ocurre igual dentro del `chatbot-service`.
>
> **⚠️ Suscripción (causa #1 de que "el WS no llega"):** `@stomp/stompjs` **NO sustituye** `/user/` automáticamente. Hay que suscribirse a la ruta **completa** `/user/{userId}/queue/chat`, donde `{userId}` = `sub` del JWT. Si el front se suscribe a `/user/queue/chat` literal (sin id) o usa un id distinto del `sub`, el backend envía a `/user/{sub}/queue/chat` y nadie lo escucha.

### 4.3 Ejemplo Angular (Ionic + `@stomp/stompjs`)

```typescript
// chat.service.ts
import { Client, Message } from "@stomp/stompjs";
import * as SockJS from "sockjs-client";

export interface ChatRequest {
  message: string;
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

  connect(jwtToken: string, onMessage: (resp: ChatResponse) => void): void {
    this.client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8809/ws/chat"),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    this.client.onConnect = () => {
      // El userId sale del JWT; puedes leerlo del payload del token.
      const userId = decodeUserId(jwtToken);
      this.client.subscribe(`/user/${userId}/queue/chat`, (msg: Message) => {
        const resp: ChatResponse = JSON.parse(msg.body);
        onMessage(resp);
      });
      console.log("Conectado al chat WebSocket");
    };

    this.client.activate();
  }

  sendMessage(message: string): void {
    const payload: ChatRequest = { message };
    this.client.publish({ destination: "/app/chat", body: JSON.stringify(payload) });
  }

  disconnect(): void {
    this.client?.deactivate();
  }
}
```

### 4.4 Ejemplo REST (más simple, **RECOMENDADO**)

> **Vía recomendada para el chat.** El gateway protege la ruta y **exige `Authorization: Bearer <jwt>`**; sin el header responde `401`. El `userId` se deriva del `sub` del JWT (el front **no** envía `X-User-Id`).

```typescript
// chat-rest.service.ts
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

const API_URL = "http://localhost:8080/api/v1/chat";

@Injectable({ providedIn: "root" })
export class ChatRestService {
  constructor(private http: HttpClient) {}

  private headers(jwt: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${jwt}` });
  }

  // jwt = el mismo token del login (idToken/accessToken)
  sendMessage(jwt: string, message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${API_URL}`, { message }, { headers: this.headers(jwt) });
  }

  // Nuevo chat: archiva la conversación ACTIVE y crea una vacía
  resetChat(jwt: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${API_URL}/reset`, {}, { headers: this.headers(jwt) });
  }
}
```

---

## 5. Componente de UI sugerido (Ionic)

```typescript
// chat.page.ts (ejemplo de flujo completo — REST con jwt)
export class ChatPage {
  messages: { role: "user" | "assistant"; text: string }[] = [];
  input = "";

  constructor(
    private chatRest: ChatRestService,
    private auth: AuthService,
  ) {}

  async send() {
    const text = this.input.trim();
    if (!text) return;

    const jwt = await this.auth.token(); // mismo token del login (obligatorio: 401 sin él)
    if (!jwt) return;

    this.messages.push({ role: "user", text });
    this.input = "";

    // No se envía conversationId: el backend reutiliza la conversación ACTIVE del usuario
    this.chatRest.sendMessage(jwt, text).subscribe({
      next: (resp) => {
        this.messages.push({ role: "assistant", text: resp.message });
      },
      error: () => {
        this.messages.push({ role: "assistant", text: "Lo siento, no pude procesar tu consulta. Intenta de nuevo." });
      },
    });
  }

  // Botón "Nuevo chat" / "Limpiar conversación"
  async newChat() {
    const jwt = await this.auth.token();
    if (!jwt) return;

    this.chatRest.resetChat(jwt).subscribe({
      next: () => {
        this.messages = []; // vaciar el historial local
      },
      error: () => {},
    });
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

| Código  | Causa                                     | Acción del front                                                           |
| ------- | ----------------------------------------- | -------------------------------------------------------------------------- |
| `404`   | Ruta no encontrada                        | Verificar token y URL `/api/v1/chat/**` (routing del gateway ya corregido) |
| `500`   | Error del LLM o del microservicio interno | Mostrar mensaje genérico de error                                          |
| Timeout | Respuesta tardía del LLM                  | Mostrar spinner mientras dure la petición                                  |

---

## 8. Checklist de implementación

- [ ] Pantalla de chat con lista de mensajes (user/assistant)
- [ ] Campo de entrada de texto + botón enviar
- [ ] `POST /api/v1/chat` para enviar mensajes (sin `conversationId` — el backend gestiona el chat ACTIVE)
- [ ] Botón "Nuevo chat / limpiar" que llama a `POST /api/v1/chat/reset` y vacía la lista local de mensajes
- [ ] (Opcional) WebSocket STOMP para tiempo real
- [ ] Indicador de "escribiendo…" mientras carga
- [ ] Manejo de errores y off-line

---

## 9. Troubleshooting — "queda en 'escribiendo…'"

**Síntoma:** se envía el mensaje, el bubble del usuario y el spinner aparecen, pero la respuesta del bot nunca llega.

### 9.0 Si usas REST (recomendado)

El flujo REST devuelve la respuesta en el `POST`; si no llega, es casi siempre uno de estos:

1. **`401` (falta/venció el token).** El gateway exige `Authorization: Bearer <jwt>`. Verifica en el network tab que la petición manda el header y que el token no está caducado. Renovar (re-login) si expiró.
2. **No estás suscrito / no procesando la respuesta.** Confirma que el `subscribe(...)` de `sendMessage` sí ejecuta `next` y hace `push` de `resp.message`.
3. **El backend devolvió un mensaje de error amigable (no un 500).** Si el modelo local no está disponible o falla, el backend responde `200` con un mensaje amigable en español — el front **sí** lo recibe, solo que el contenido es de error. Reintentar en un momento.

> Revisa también §7 (códigos de error). El modelo local se configura con `OLLAMA_MODEL` (por defecto `qwen2.5:7b`); ver DOCUMENTACION_CHATBOT.md §5.

### 9.1 (Solo WebSocket) Verifica que la suscripción ocurra

En `chat-ws.service.ts`, la suscripción se hace **dentro** de `onConnect`:

```typescript
onConnect: () => {
  if (userId) {
    this.client?.subscribe(`/user/${userId}/queue/chat`, ...);
  }
}
```

> **Ojo:** el `userId` se captura como `const` **antes** de conectar (`const userId = this.authService.userId()`). Si el login aún no ha cargado el usuario (o el token no tiene `sub`), `userId` será `null`/`undefined` y **nunca se suscribirá** → el bot nunca responderá. Asegúrate de que `AuthService.userId()` (`= decoded.sub`) esté poblado antes de llamar a `connect()`.

### 9.2 (Solo WebSocket) Verifica que coincida el `userId`

- **Frontend** suscribe a `/user/{sub}/queue/chat` donde `sub = payload.sub` del JWT.
- **Backend** envía a `convertAndSendToUser(...)` usando `jwt.getSubject()` (= el mismo `sub`).

Si ambos usan el `sub`, coinciden. Si el `auth.user()` se llena desde otra fuente (p.ej. una respuesta de login con un `id` distinto), la suscripción puede apuntar a un canal donde el backend no envía.

### 9.3 (Solo WebSocket) ¿Envió el backend la respuesta?

Mira los logs de `chatbot-service`:

- `INFO Enviando respuesta WS al usuario <id> (conv <id>): <respuesta>` → el backend **sí** envió. El problema está en la suscripción del front (revisa 9.1/9.2) **o** en que la conexión es **vía gateway (8080)**, que no devuelve de forma fiable la respuesta por-usuario → **cambia a REST (§4.4)**.
- Si **no** aparece esa línea pero sí `ERROR Error procesando mensaje WebSocket...` → es un error del backend/LLM (revisa DOCUMENTACION_CHATBOT.md §15.7).

### 9.4 (Solo WebSocket) Revisa el network tab / consola

- Confirmar que la conexión STOMP se establece (`onConnect` dispara, `connected` = `true`).
- Confirmar que `publish({ destination: '/app/chat' })` se ejecuta (debe haber un frame enviado).
- Cualquier error CORS o de handshake se ve en consola.
