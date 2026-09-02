import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  toolCalls?: ToolCall[] | null;
}

/**
 * Servicio de chat del asistente Turiscol.
 *
 * Usa REST (POST /api/v1/chat) en lugar de WebSocket STOMP: es más fiable
 * (el WS por gateway no devolvía la respuesta de forma consistente) y el
 * authInterceptor añade automáticamente el `Authorization: Bearer <jwt>`
 * y maneja el refresh en 401.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatWsService {
  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/chat`;

  sendMessage(message: string, conversationId?: string): Observable<ChatResponse> {
    const payload: ChatRequest = { message, conversationId };
    return this.http.post<ChatResponse>(this.api, payload);
  }
}
