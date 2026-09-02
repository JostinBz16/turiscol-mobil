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

  constructor() {
    addIcons({ close, send, chatbubbleEllipses, sparklesOutline });
  }

  ionViewWillEnter() {
    this.waiting = false;
  }

  quickQuestion(text: string) {
    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.sendMessage(text);
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

  private sendMessage(text: string) {
    this.waiting = true;
    this.chatWs.sendMessage(text, this.currentConversationId).subscribe({
      next: (resp) => this.onMessage(resp),
      error: () => {
        this.waiting = false;
      },
    });
  }

  send() {
    const text = this.input.trim();
    if (!text || this.waiting) return;

    this.messages.update((m) => [...m, { role: 'user', text }]);
    this.input = '';
    this.sendMessage(text);
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
