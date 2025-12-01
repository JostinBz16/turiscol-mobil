import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { PriceListComponent } from './components/price-list/price-list.component';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { CityFilterComponent } from '../../shared/components/city-filter/city-filter.component';

@Component({
  selector: 'app-prices',
  standalone: true,
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    PriceListComponent,
    CityFilterComponent,
  ],
})
export class PricesPage implements OnInit {
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
  selectedCity: any = null;

  ngOnInit() {
    addIcons({
      addCircleOutline,
    });
    // Filtrar automáticamente con la ciudad por defecto
    this.filterByCity(this.selectedCity);
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

  filterByCity(cityObj: any) {
    console.log('Ciudad seleccionada:', cityObj);

    this.selectedCity = cityObj;

    if (!cityObj) {
      this.groupedPrices = [];
      return;
    }

    // Filtrar por el nombre de la ciudad (cityObj.name)
    const filtered = this.prices.filter((p) => p.city === cityObj.name);
    this.groupByCategory(filtered);
  }

  onCitySelected(cityObj: any) {
    this.selectedCity = cityObj;
    this.filterByCity(cityObj);
  }

  resetCityFilter() {
    this.selectedCity = null;
    this.groupedPrices = [];
  }
}
