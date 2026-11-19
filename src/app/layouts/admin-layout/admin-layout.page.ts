import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import {
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, cashOutline, peopleOutline, storefrontOutline, calendarOutline, mapOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.page.html',
  styleUrls: ['./admin-layout.page.scss'],
  standalone: true,
  imports: [
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonRouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
})
export class AdminLayoutPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({ homeOutline, cashOutline, peopleOutline, storefrontOutline, calendarOutline, mapOutline, logOutOutline });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}
