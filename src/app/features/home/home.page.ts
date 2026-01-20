import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notifications, searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    IonContent,
    IonHeader,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
  ],
})
export class HomePage implements OnInit {
  categories = [
    { label: 'Tours', icon: 'map-outline' },
    { label: 'Hoteles', icon: 'bed-outline' },
    { label: 'Guías', icon: 'people-outline' },
    { label: 'Transporte', icon: 'car-outline' },
  ];

  destinations = [
    { name: 'Cartagena', city: 'Bolívar', image: 'assets/cartagena.jpg' },
    { name: 'Medellín', city: 'Antioquia', image: 'assets/medellin.jpg' },
  ];

  plans = [
    {
      title: 'Tour Islas del Rosario',
      description: 'Full day con transporte',
      price: 250000,
      image: 'assets/rosario.jpg',
    },
  ];

  constructor() {
    addIcons({ searchOutline, notifications });
  }

  ngOnInit() {}
}
