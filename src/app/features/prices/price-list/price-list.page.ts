import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
  imports: [
    IonBackButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    IonCardContent,
    IonCard,
  ],
})
export class PriceListPage implements OnInit {
  cityId!: number;
  cityName = '';
  prices: any[] = [];

  private allPrices = [
    {
      name: 'Tour Ciudad',
      price: 120000,
      cityId: 1,
      city: 'Bogotá',
      category: 'Tours',
    },
    {
      name: 'Tour Graffiti',
      price: 90000,
      cityId: 1,
      city: 'Bogotá',
      category: 'Tours',
    },
    {
      name: 'Cabalgata',
      price: 150000,
      cityId: 2,
      city: 'Medellín',
      category: 'Experiencias',
    },
    {
      name: 'Clase de Cocina',
      price: 180000,
      cityId: 2,
      city: 'Medellín',
      category: 'Experiencias',
    },
    {
      name: 'Visita al Zoológico',
      price: 80000,
      cityId: 3,
      city: 'Cali',
      category: 'Tours',
    },
    {
      name: 'Paseo en Bicicleta',
      price: 70000,
      cityId: 3,
      city: 'Cali',
      category: 'Experiencias',
    },
    {
      name: 'Tour Histórico',
      price: 110000,
      cityId: 4,
      city: 'Barranquilla',
      category: 'Tours',
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.cityId = Number(this.route.snapshot.paramMap.get('cityId'));
    this.loadPrices();
  }

  loadPrices() {
    this.prices = this.allPrices.filter((p) => p.cityId === this.cityId);
    this.cityName = this.prices[0]?.city ?? 'Ciudad';
  }
}
