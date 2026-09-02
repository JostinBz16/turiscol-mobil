import { Injectable, inject, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
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
  toolCalls?: ToolCall[] | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChatWsService {
  private authService = inject(AuthService);

  private client: Client | null = null;

  connected = signal(false);
  connecting = signal(false);

  connect(onMessage: (resp: ChatResponse) => void): void {
    if (this.client?.active) return;

    const userId = this.authService.userId();
    const token = localStorage.getItem('access_token') ?? '';
    const url = environment.chatWsUrl;

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
        if (userId) {
          this.client?.subscribe(`/user/${userId}/queue/chat`, (msg: IMessage) => {
            try {
              const resp: ChatResponse = JSON.parse(msg.body);
              onMessage(resp);
            } catch {
              onMessage({ conversationId: '', message: msg.body });
            }
          });
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
