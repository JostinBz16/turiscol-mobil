import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTextarea,
  IonButton,
  IonIcon,
  IonButtons,
  IonSpinner,
  IonChip,
  IonLabel,
  IonFooter,
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
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonTextarea,
    IonButton,
    IonIcon,
    IonButtons,
    IonSpinner,
    IonChip,
    IonLabel,
    IonFooter,
  ],
})
export class ChatPage {
  @ViewChild('content', { static: false }) content!: ElementRef;
  @ViewChild('inputArea', { static: false }) inputArea!: ElementRef;

  private chatWs = inject(ChatWsService);
  private router = inject(Router);
  private navCtrl = inject(NavController);

  messages = signal<ChatMessage[]>([]);
  input = '';
  currentConversationId?: string;
  waiting = false;
  private connected = false;

  constructor() {
    addIcons({ close, send, chatbubbleEllipses, sparklesOutline });
  }

  ionViewWillEnter() {
    this.waiting = false;
    this.connected = false;
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
    if (ev.detail?.key === 'Enter') {
      this.send();
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        this.content?.nativeElement?.scrollToBottom(300);
      } catch {
        /* noop */
      }
    }, 50);
  }

  closeChat() {
    this.navCtrl.back();
  }
}
