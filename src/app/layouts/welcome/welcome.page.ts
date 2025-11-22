import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonImg } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonImg, IonButton, IonContent, CommonModule, FormsModule],
})
export class WelcomePage {
  constructor(private router: Router) {}

  startApp() {
    // Guardamos que ya se mostró la bienvenida
    localStorage.setItem('welcomeShown', 'true');
    this.router.navigateByUrl('auth/login', { replaceUrl: true });
  }
}
