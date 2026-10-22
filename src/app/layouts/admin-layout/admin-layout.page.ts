import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
import { homeOutline, cashOutline, peopleOutline, storefrontOutline, calendarOutline } from 'ionicons/icons';

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
  constructor() {
    addIcons({ homeOutline, cashOutline, peopleOutline, storefrontOutline, calendarOutline });
  }
}
