import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { CityFilterComponent } from '../../components/city-filter/city-filter.component';
import { Router } from '@angular/router';

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
    CityFilterComponent,
  ],
})
export class PricesPage implements OnInit {
  // Ciudad seleccionada como objeto

  groupedPrices: any[] = [];

  ngOnInit() {
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

  constructor(private router: Router) {}

  goToCity(city: any) {
    this.router.navigate(['/tabs/prices/city/', city.id]);
  }
}
