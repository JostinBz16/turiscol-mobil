import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonIcon,
  IonList,
  IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  bookmarkOutline,
  chevronForwardOutline,
  createOutline,
  logOutOutline,
  notificationsOutline,
  personAddOutline,
  personOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/login/services/auth';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonList,
    IonIcon,
    IonItem,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class AccountPage implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    addIcons({
      personOutline,
      createOutline,
      chevronForwardOutline,
      bookmarkOutline,
      notificationsOutline,
      logOutOutline,
    });
  }

  ngOnInit() {
    addIcons({
      personAddOutline,
      createOutline,
      chevronForwardOutline,
      bookmarkOutline,
      notificationsOutline,
      logOutOutline,
    });
  }

  logout() {
    this.authService.logout();
    // Aquí puedes limpiar estado, token, etc.
    this.router.navigate(['/auth/login'], {
      replaceUrl: true,
    });
  }

  goToEditProfile() {
    this.router.navigate(['/tabs/account/edit']);
  }
  goToReservations() {
    this.router.navigate(['/tabs/account/reservations']);
  }
}
