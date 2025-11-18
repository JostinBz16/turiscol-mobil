import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonButtons,
  IonContent,
} from '@ionic/angular/standalone';
import { CityFilterComponent } from './components/price-filter/price-filter.component';
import { PriceListComponent } from './components/price-list/price-list.component';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-prices',
  standalone: true,
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
  imports: [
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonToolbar,
    IonHeader,
    PriceListComponent,
    CityFilterComponent,
  ],
})
export class PricesPage implements OnInit {
  cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];

  isAdmin = true; // Cambia según tu auth real

  prices = [
    { name: 'Tour Ciudad', price: 120000, city: 'Bogotá', category: 'Tours' },
    { name: 'Tour Graffiti', price: 90000, city: 'Bogotá', category: 'Tours' },
    {
      name: 'Cabalgata',
      price: 150000,
      city: 'Medellín',
      category: 'Experiencias',
    },
    {
      name: 'Clase de Cocina',
      price: 180000,
      city: 'Medellín',
      category: 'Experiencias',
    },
  ];

  groupedPrices: any[] = [];

  ngOnInit() {
    this.groupByCategory(this.prices);
    addIcons({
      addCircleOutline,
    });
  }

  groupByCategory(data: any[]) {
    const map: any = {};

    data.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });

    this.groupedPrices = Object.keys(map).map((cat) => ({
      category: cat,
      items: map[cat],
    }));
  }

  filterByCity(city: string) {
    console.log(city);
    if (!city) {
      this.groupedPrices = [];
      return;
    }

    const filtered = this.prices.filter((p) => p.city === city);
    this.groupByCategory(filtered);
  }

  openRegisterModal() {
    console.log('Abrir modal registrar nuevo precio (solo admin)');
  }
}
