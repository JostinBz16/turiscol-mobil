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
  settingsOutline,
  heartOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/login/services/auth';
import { NavigationService } from 'src/app/core/services/navigation.service';

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
    private navService: NavigationService,
  ) {
    addIcons({
      personOutline,
      createOutline,
      chevronForwardOutline,
      bookmarkOutline,
      heartOutline,
      notificationsOutline,
      logOutOutline,
      settingsOutline,
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
    this.navService.setReturnUrl('/tabs/account');
    this.router.navigate(['/tabs/account/edit']);
  }
  goToReservations() {
    this.navService.setReturnUrl('/tabs/account');
    this.router.navigate(['/tabs/account/reservations']);
  }

  goToFavorites() {
    this.navService.setReturnUrl('/tabs/account');
    this.router.navigate(['/tabs/account/favorites']);
  }
}
