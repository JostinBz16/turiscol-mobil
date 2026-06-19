import { Component, inject, OnInit } from '@angular/core';
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
  IonButtons,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  bookmarkOutline,
  chevronForwardOutline,
  createOutline,
  logOutOutline,
  notificationsOutline,
  personAddOutline,
  personOutline,
  settingsOutline,
  heartOutline,
  gridOutline,
  receiptOutline,
} from 'ionicons/icons';
import { AuthService } from '../../auth/login/services/auth';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonButtons,
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
  private router = inject(Router);
  authService = inject(AuthService);
  private navService = inject(NavigationService);

  private authStore = inject(AuthService);
  role = this.authStore.role;
  constructor() {
    addIcons({
      arrowBack,
      personOutline,
      createOutline,
      chevronForwardOutline,
      bookmarkOutline,
      heartOutline,
      notificationsOutline,
      logOutOutline,
      settingsOutline,
      gridOutline,
      receiptOutline,
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

  goBack() {
    const returnUrl = localStorage.getItem('account_return_url');
    localStorage.removeItem('account_return_url');
    this.router.navigate([returnUrl || '/tabs/home'], { replaceUrl: true });
  }

  logout() {
    this.authService.logout();
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

  goToManageOffers() {
    this.navService.setReturnUrl('/tabs/account');
    this.router.navigate(['/tabs/manage-offers']);
  }

  goToSales() {
    this.navService.setReturnUrl('/tabs/account');
    this.router.navigate(['/tabs/provider-sales']);
  }
}
