import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  businessOutline,
  mapOutline,
  locationOutline,
  chevronForwardOutline,
  refreshOutline,
  addOutline,
} from 'ionicons/icons';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-admin-locations',
  standalone: true,
  imports: [
    RouterModule,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    AdminPageHeaderComponent,
  ],
  templateUrl: './admin-locations.page.html',
  styleUrls: ['./admin-locations.page.scss'],
})
export class AdminLocationsPage {
  constructor() {
    addIcons({
      refreshOutline,
      addOutline,
      businessOutline,
      chevronForwardOutline,
      mapOutline,
      locationOutline,
    });
  }
}
