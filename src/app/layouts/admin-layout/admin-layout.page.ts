import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import {
  IonSplitPane,
  IonMenu,
  IonContent,
  IonFooter,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, cashOutline, peopleOutline, storefrontOutline, calendarOutline,
  mapOutline, logOutOutline, pricetagsOutline, compassOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss'],
  standalone: true,
  imports: [
    IonSplitPane,
    IonMenu,
    IonContent,
    IonFooter,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonRouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class AdminLayoutPage {
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      homeOutline, cashOutline, peopleOutline, storefrontOutline, calendarOutline,
      mapOutline, logOutOutline, pricetagsOutline, compassOutline,
    });
  }

  logout() {
    this.authService.logout();
    // Full reload on purpose: it discards in-memory state and Ionic's page stack,
    // so going Back never shows the previous user's content.
    window.location.replace('/auth/login');
  }
}
