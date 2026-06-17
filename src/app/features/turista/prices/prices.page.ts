import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,

  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, person, locationOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { CityFilterComponent } from '../../../components/city-filter/city-filter.component';
import { Router } from '@angular/router';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';

@Component({
  selector: 'app-prices',
  standalone: true,
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, IonHeader, IonToolbar, IonButtons, IonButton, CityFilterComponent, CitySelectorBarComponent],
})
export class PricesPage implements OnInit {
  private selectedCityService = inject(SelectedCityService);
  private navCtrl = inject(NavController);
  city = this.selectedCityService.city;
  groupedPrices: any[] = [];

  ngOnInit() {
    addIcons({
      addCircleOutline,
      person,
      locationOutline,
    });
  }

  goToProfile() {
    this.navCtrl.navigateRoot('/tabs/account');
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
