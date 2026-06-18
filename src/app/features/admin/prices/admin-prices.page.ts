import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, createOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-prices',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton,
  ],
  templateUrl: './admin-prices.page.html',
  styleUrls: ['./admin-prices.page.scss'],
})
export class AdminPricesPage {
  constructor() {
    addIcons({ addCircleOutline, createOutline });
  }
}
