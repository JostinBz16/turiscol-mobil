import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonItem, IonLabel, IonInput, IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-prices',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonItem, IonLabel, IonInput, IonList,
  ],
  templateUrl: './admin-prices.page.html',
  styleUrls: ['./admin-prices.page.scss'],
})
export class AdminPricesPage {
  constructor() {
    addIcons({ addCircleOutline, createOutline });
  }
}
