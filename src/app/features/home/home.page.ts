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
    { id: 1, label: 'Tours' },
    { id: 2, label: 'Hoteles' },
    { id: 3, label: 'Guías' },
    { id: 4, label: 'Transporte' },
    { id: 5, label: 'Restaurantes' },
    { id: 6, label: 'Experiencias' },
  ];

  destinations = [
    {
      id: 1,
      name: 'Cartagena',
      city: 'Bolívar',
      image:
        'https://mlqfmr3rpryd.i.optimole.com/cb:JBSP.a525/w:auto/h:auto/q:100/ig:avif/https://cartagena-tours.co/wp-content/uploads/2023/12/Torre-del-Reloj-en-Cartagena-de-Indias-Colombia.jpg',
    },
    {
      id: 2,
      name: 'Medellín',
      city: 'Antioquia',
      image: 'https://www.minuto30.com/wp-content/uploads/2020/01/medellin.jpg',
    },
    {
      id: 3,
      name: 'Bogotá',
      city: 'Cundinamarca',
      image:
        'https://desarrolloeconomico.gov.co/wp-content/uploads/2023/05/167_Colpatria8_RicardoBaez_small.jpg',
    },
    {
      id: 4,
      name: 'Cali',
      city: 'Valle del Cauca',
      image:
        'https://www.cali.gov.co/info/caligovco_se/media/pubInt/thumbs/thpubInt_700X400_186322.webp',
    },
    {
      id: 5,
      name: 'Santa Marta',
      city: 'Magdalena',
      image:
        'https://www.santamarta.gov.co/sites/default/files/el_rodadero_web.jpg?fid=27409',
    },
    {
      id: 6,
      name: 'Bucaramanga',
      city: 'Santander',
      image:
        'https://www.hotelrivieraplaza.com/wp-content/uploads/2022/07/bucaramanga-de-noche-santander-colombia.jpg',
    },
  ];

  plans = [
    {
      title: 'Tour Islas del Rosario',
      description: 'Full day con transporte',
      price: 250000,
      image:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/e9/fb/58/caption.jpg?w=1000&h=1000&s=1',
    },
  ];

  constructor() {
    addIcons({ searchOutline, notifications });
  }

  ngOnInit() {}
}
