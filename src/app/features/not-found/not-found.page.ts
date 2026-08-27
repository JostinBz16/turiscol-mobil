import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
})
export class NotFoundPage {
  private router = inject(Router);

  constructor() {
    addIcons({ homeOutline });
  }

  goHome() {
    this.router.navigate(['/tabs/home']);
  }
}
