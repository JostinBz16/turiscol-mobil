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

> **✅ Estado actual:** la app implementa **WebSocket STOMP** (`ChatWsService`) como vía principal. El gateway enruta correctamente REST (`/api/v1/chat/**`) y WebSocket (`/ws/chat/**`). WebSocket directo al puerto `8809` sigue siendo la opción más simple y probada.

---

## 2. Configuración de URLs

Las URLs se configuran en los archivos de environment:

```typescript
// src/environments/environment.ts (desarrollo)
export const environment = {
  apiUrl: 'http://192.168.0.103:8080/api/v1',       // REST (gateway)
  chatWsUrl: 'http://192.168.0.103:8809/ws/chat',   // WebSocket (directo al microservicio)
};

// src/environments/environment.prod.ts (producción)
export const environment = {
  apiUrl: 'https://api.turiscol.com/api/v1',
  chatWsUrl: 'https://chat.turiscol.com/ws/chat',    // SockJS con HTTPS → upgrade a WSS
};
```

| Entorno    | REST (vía gateway)                    | WebSocket (directo, recomendado)         | WebSocket (vía gateway)                 |
| ---------- | ------------------------------------- | ---------------------------------------- | --------------------------------------- |
| **Local**  | `${environment.apiUrl}/chat`          | `${environment.chatWsUrl}`               | `http://localhost:8080/ws/chat`         |
| **Docker** | `${environment.apiUrl}/chat`          | `${environment.chatWsUrl}`               | `http://localhost:8080/ws/chat`         |
| **Prod**   | `https://api.turiscol.com/api/v1/chat`| `https://chat.turiscol.com/ws/chat`      | `https://api.turiscol.com/ws/chat`      |

> **⚠️ SockJS usa `http://` / `https://`, no `ws://`.** SockJS negocia la conexión internamente y hace upgrade a WebSocket. En el código se pasa siempre una URL HTTP/HTTPS, no `ws://`.

> **⚠️ WebSocket vía gateway (8080): NO recomendado.** Vía gateway el `chatbot-service` recibe el mensaje y envía la respuesta, pero con frecuencia la respuesta no llega de vuelta al front porque el proxy/STOMP no preserva la sesión `{sub}` y el header `Authorization` (tokens vencen → `Jwt expired`). **Usa la conexión directa al puerto `8809`** (`environment.chatWsUrl`).

> **✅ Gateway ya enruta correctamente:**
>
> - **REST** (`/api/v1/chat/**` → `StripPrefix=0`): corregido y verificado.
> - **WebSocket** (`/ws/chat/**`): ruta `chatbot-websocket` agregada antes de `/ws/**`. Conexión directa al `8809` sigue siendo la más simple.

---

## 3. Autenticación

> **El `authInterceptor` (Angular) ya adjunta automáticamente el header `Authorization: Bearer <jwt>` a todas las peticiones HTTP hacia `environment.apiUrl`.** No es necesario enviar el token manualmente en cada llamada REST. El interceptor también maneja el refresh automático del token ante un `401`.

Para **WebSocket**, el token se envía en el frame `CONNECT` a través de `connectHeaders`:

```typescript
connectHeaders: {
  Authorization: `Bearer ${token}`,  // token de localStorage('access_token')
}
```

El `userId` (sujeto de la cola privada) se deriva del `sub` del JWT, no se envía desde el cliente.

---

## 4. Endpoints REST

Base (gateway): `${environment.apiUrl}/chat`

### 4.1 POST `/` — Enviar mensaje

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

**Headers requeridos (REST):** el `authInterceptor` agrega `Authorization: Bearer <jwt>` automáticamente. Sin token el gateway responde `401`. El `userId` se deriva del `sub` del JWT.

### 4.2 GET `/conversations` — Listar conversaciones

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

### 4.3 GET `/conversations/{id}` — Detalle de conversación

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

### 4.4 DELETE `/conversations/{id}` — Eliminar conversación

**Response:** `204 No Content`. Solo elimina si la conversación pertenece al usuario.

---

## 5. WebSocket STOMP (Chat en tiempo real) — NO recomendado

> **⚠️ Aviso importante:** para el chat usa la conexión **directa al puerto `8809`** (la más fiable) o **REST (§7)**.
>
> - **REST** devuelve la respuesta directamente en el `POST` (simple, fiable, recomendado).
> - **WebSocket vía gateway (8080)** no es confiable: el `chatbot-service` recibe el mensaje y envía la respuesta (log `Enviando respuesta WS al usuario ...`) pero con frecuencia la respuesta **no llega de vuelta al front** (el proxy/STOMP no preserva la sesión `{sub}` ni el `Authorization`, y los tokens vencen → `Jwt expired`).
> - **WebSocket directo al 8809** funciona mejor, pero exige que la suscripción apunte exactamente a `/user/{sub}/queue/chat` y que `@stomp/stompjs` reciba la ruta **completa** (no la sustituye automáticamente).

Solo se documenta WebSocket a continuación por completitud/historial.

### 5.1 Configuración

| Propiedad              | Valor                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| Endpoint de conexión   | `environment.chatWsUrl` (directo, recomendado) o `http://<gateway>:8080/ws/chat` (vía gateway) |
| Header en `CONNECT`    | `Authorization: Bearer <jwt>` (obligatorio)                                                  |
| Prefijo de envío (app) | `/app`                                                                                       |
| Destino de envío       | `/app/chat`                                                                                  |
| Destino de suscripción | `/user/{userId}/queue/chat`                                                                  |
| Prefijo broker         | `/topic`, `/queue`                                                                           |

### 5.2 Flujo

1. **Conectar** al endpoint STOMP (`environment.chatWsUrl` directo o vía gateway), enviando `Authorization: Bearer <jwt>` en el frame `CONNECT`. Sin token la conexión se rechaza o se mapea a `anonymous`.
2. **Suscribirse** a `/user/{userId}/queue/chat` (tu cola privada). El `userId` es el `sub` del JWT.
3. **Enviar** `ChatRequest` (misma estructura que REST) a `/app/chat`
4. **Recibir** la respuesta en la cola suscrita

> El servidor valida el JWT en el `CONNECT` con Keycloak y lo usa como `Principal` de la sesión STOMP. El `userId` para la cola privada sale de ese `Principal`; no se debe confiar en un `userId` arbitrario que envíe el cliente. Conectando directo al `8809` el gateway no está involucrado, pero la autenticación ocurre igual dentro del `chatbot-service`.
>
> **⚠️ Suscripción (causa #1 de que "el WS no llega"):** `@stomp/stompjs` **NO sustituye** `/user/` automáticamente. Hay que suscribirse a la ruta **completa** `/user/{userId}/queue/chat`, donde `{userId}` = `sub` del JWT. Si el front se suscribe a `/user/queue/chat` literal (sin id) o usa un id distinto del `sub`, el backend envía a `/user/{sub}/queue/chat` y nadie lo escucha.

### 5.3 Ejemplo WebSocket ( Ionic + `@stomp/stompjs`)

> Este ejemplo refleja la implementación actual en `chat-ws.service.ts`.

```typescript
// chat-ws.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';               // default import, NO import * as SockJS
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/features/auth/login/services/auth';

export interface ToolCall {
  toolName: string;
  arguments: string;
  result: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: string;
  toolCalls?: ToolCall[] | null;                  // nullable
}

@Injectable({ providedIn: 'root' })
export class ChatWsService {
  private authService = inject(AuthService);
  private client: Client | null = null;

  connected = signal(false);
  connecting = signal(false);

  connect(onMessage: (resp: ChatResponse) => void): void {
    if (this.client?.active) return;

    const token = localStorage.getItem('access_token') ?? '';
    const url = environment.chatWsUrl;            // SockJS usa http://, NO ws://

    this.connecting.set(true);

    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected.set(true);
        this.connecting.set(false);
        // Resolver el userId en el momento de conectar (el sub del JWT),
        // no antes, para no suscribirnos con un id vacío.
        const userId = this.authService.userId();
        if (userId) {
          this.client?.subscribe(`/user/${userId}/queue/chat`, (msg: IMessage) => {
            try {
              const resp: ChatResponse = JSON.parse(msg.body);
              onMessage(resp);
            } catch {
              onMessage({ conversationId: '', message: msg.body });
            }
          });
        } else {
          console.warn('Chat WS conectado pero sin userId (sub) para suscribirse');
        }
      },
      onWebSocketClose: () => {
        this.connected.set(false);
        this.connecting.set(false);
      },
      onStompError: () => {
        this.connecting.set(false);
      },
    });

    this.client.activate();
  }

  sendMessage(message: string, conversationId?: string): void {
    const payload: ChatRequest = { message, conversationId };
    this.client?.publish({
      destination: '/app/chat',
      body: JSON.stringify(payload),
    });
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
    this.connected.set(false);
    this.connecting.set(false);
  }
}
```

---

## 6. Servicio REST (alternativa, más simple)

> **Vía alternativa al WebSocket.** El `authInterceptor` ya adjunta `Authorization: Bearer <jwt>` automáticamente a todas las peticiones hacia `environment.apiUrl`. No es necesario enviar el token manualmente.

```typescript
// chat-rest.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ChatResponse } from './chat-ws.service';   // reutiliza la interfaz

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: { role: string; content: string; timestamp: string; toolCalls?: any }[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  metadata: any;
}

@Injectable({ providedIn: 'root' })
export class ChatRestService {
  private http = inject(HttpClient);
  private API_URL = `${environment.apiUrl}/chat`;

  // No necesita jwt: el authInterceptor lo adjunta automáticamente
  sendMessage(message: string, conversationId?: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(this.API_URL, { message, conversationId });
  }

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.API_URL}/conversations`);
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.API_URL}/conversations/${id}`);
  }

  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/conversations/${id}`);
  }
}
```

---

## 7. Componente de UI (Ionic — implementación actual)

> Este ejemplo refleja la implementación real en `chat.page.ts`. Usa **WebSocket** (`ChatWsService`) con signals de Angular.

```typescript
// chat.page.ts
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonTextarea,
  IonButton, IonIcon, IonButtons, IonSpinner, IonChip, IonLabel, IonFooter,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, send, chatbubbleEllipses, sparklesOutline } from 'ionicons/icons';
import { ChatResponse, ChatWsService } from 'src/app/core/services/chat-ws.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonTextarea, IonButton, IonIcon, IonButtons, IonSpinner, IonChip, IonLabel, IonFooter,
  ],
})
export class ChatPage {
  @ViewChild('content', { static: false }) content!: ElementRef;

  private chatWs = inject(ChatWsService);
  private navCtrl = inject(NavController);

  messages = signal<ChatMessage[]>([]);
  input = '';
  currentConversationId?: string;
  waiting = false;

  constructor() {
    addIcons({ close, send, chatbubbleEllipses, sparklesOutline });
  }

  ionViewWillEnter() {
    this.waiting = false;
    this.chatWs.connect((resp: ChatResponse) => this.onMessage(resp));
  }

  ionViewWillLeave() {
    this.chatWs.disconnect();
  }

  quickQuestion(text: string) {
    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.waiting = true;
    this.chatWs.sendMessage(text, this.currentConversationId);
    this.scrollToBottom();
  }

  private onMessage(resp: ChatResponse) {
    this.waiting = false;
    this.currentConversationId = resp.conversationId;
    if (resp.message) {
      this.messages.update((m) => [...m, { role: 'assistant', text: resp.message }]);
      this.scrollToBottom();
    }
  }

  send() {
    const text = this.input.trim();
    if (!text || this.waiting) return;
    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.input = '';
    this.waiting = true;
    this.chatWs.sendMessage(text, this.currentConversationId);
    this.scrollToBottom();
  }

  onEnter(event: Event) {
    const ev = event as CustomEvent;
    if (ev.detail?.key === 'Enter') this.send();
  }

  private scrollToBottom() {
    setTimeout(() => {
      try { this.content?.nativeElement?.scrollToBottom(300); } catch { /* noop */ }
    }, 50);
  }

  closeChat() {
    this.navCtrl.back();
  }
}
```

---

## 8. Casos de uso soportados (lo que el chatbot puede responder)

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

## 9. Manejo de errores

| Código  | Causa                                     | Acción del front                                                             |
| ------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `404`   | Ruta no encontrada                        | Verificar token y URL `${environment.apiUrl}/chat/**` (routing ya corregido) |
| `429`   | Rate limit de Groq / LLM sobrecargado     | Reintentar en unos segundos (el backend responde `200` con mensaje amigable) |
| `500`   | Error del LLM o del microservicio interno | Mostrar mensaje genérico de error                                            |
| Timeout | Respuesta tardía del LLM                  | Mostrar spinner mientras dure la petición                                    |

---

## 10. Checklist de implementación

- [x] Pantalla de chat con lista de mensajes (user/assistant) — `chat.page.html`
- [x] Campo de entrada de texto + botón enviar — `chat.page.html`
- [x] WebSocket STOMP para enviar/recibir mensajes — `chat-ws.service.ts`
- [x] Guardar `conversationId` de la respuesta para continuar el hilo — `chat.page.ts`
- [x] Indicador de "escribiendo…" mientras carga — `waiting` signal
- [ ] Pantalla de historial (`GET /api/v1/chat/conversations`)
- [ ] Cargar conversación existente (`GET /api/v1/chat/conversations/{id}`)
- [ ] Opción de eliminar conversación (`DELETE /api/v1/chat/conversations/{id}`)
- [ ] (Opcional) REST para chat como alternativa a WebSocket
- [ ] Manejo de errores y off-line

---

## 11. Troubleshooting — "queda en 'escribiendo…'"

**Síntoma:** se envía el mensaje, el bubble del usuario y el spinner aparecen, pero la respuesta del bot nunca llega.

### 11.1 Si usas WebSocket (implementación actual)

1. **Verifica que la suscripción ocurra.** En `chat-ws.service.ts`, la suscripción se hace **dentro** de `onConnect`. El `userId` se resuelve con `this.authService.userId()` al momento de conectar. Si `AuthService.userId()` (= `decoded.sub`) es `null`/`undefined` (el login aún no ha cargado o el token no tiene `sub`), **nunca se suscribirá** y el bot nunca responderá.

2. **Verifica que coincida el `userId`.**
   - **Frontend** suscribe a `/user/{sub}/queue/chat` donde `sub = payload.sub` del JWT.
   - **Backend** envía a `convertAndSendToUser(...)` usando `jwt.getSubject()` (= el mismo `sub`).
   - Si `auth.user()` se llena desde otra fuente (p.ej. un `id` distinto), la suscripción puede apuntar a un canal donde el backend no envía.

3. **Revisa los logs de `chatbot-service`:**
   - `INFO Enviando respuesta WS al usuario <id> (conv <id>): <respuesta>` → el backend **sí** envió. El problema está en la suscripción del front (revisa 11.1.1/11.1.2) **o** en que la conexión es **vía gateway (8080)** → **cambia a conexión directa (`environment.chatWsUrl`)**.
   - Si **no** aparece esa línea pero sí `ERROR Error procesando mensaje WebSocket...` → es un error del backend/LLM.

4. **Revisa el network tab / consola:**
   - Confirmar que la conexión STOMP se establece (`onConnect` dispara, `connected` = `true`).
   - Confirmar que `publish({ destination: '/app/chat' })` se ejecuta (debe haber un frame enviado).
   - Cualquier error CORS o de handshake se ve en consola.

### 11.2 Si usas REST

El flujo REST devuelve la respuesta en el `POST`; si no llega, es casi siempre uno de estos:

1. **`401` (falta/venció el token).** Verifica en el network tab que la petición manda el header `Authorization: Bearer` y que el token no está caducado. El `authInterceptor` maneja el refresh automáticamente; si falla, redirige a login.
2. **No estás procesando la respuesta.** Confirma que el `subscribe(...)` de `sendMessage` sí ejecuta `next` y hace `push` de `resp.message`.
3. **El backend devolvió un mensaje de error amigable (no un 500).** Ante `429` (rate limit de Groq) o error del LLM, el backend responde `200` con texto tipo "Lo siento, el proveedor..." — el front **sí** lo recibe, solo que el contenido es de error. Reintentar en unos segundos.
