import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chatbubbles } from 'ionicons/icons';
import { AuthService } from 'src/app/features/auth/login/services/auth';

@Component({
  selector: 'app-chat-fab',
  standalone: true,
  templateUrl: './chat-fab.component.html',
  styleUrls: ['./chat-fab.component.scss'],
  imports: [IonIcon],
})
export class ChatFabComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  show = computed(
    () => this.authService.isAuthenticated() && this.authService.role() === 'turista',
  );

  constructor() {
    addIcons({ chatbubbles });
  }

  openChat() {
    this.router.navigate(['/chat']);
  }
}
