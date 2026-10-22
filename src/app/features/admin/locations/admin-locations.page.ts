import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { businessOutline, mapOutline, locationOutline, chevronForwardOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [
    RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonList, IonItem, IonLabel, IonIcon,
  ],
  templateUrl: './admin-locations.page.html',
  styleUrls: ['./admin-locations.page.scss'],
})
export class AdminLocationsPage {
  constructor() {
    addIcons({ businessOutline, mapOutline, locationOutline, chevronForwardOutline });
  }
}
