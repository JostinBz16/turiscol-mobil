import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonIcon,
  IonButtons,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, person, locationOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';
import { PriceService } from 'src/app/core/services/price';
import { Price } from 'src/app/core/models/Price';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-prices',
  standalone: true,
  templateUrl: './prices.page.html',
  styleUrls: ['./prices.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, IonHeader, IonToolbar, IonButtons, IonButton, IonSpinner, CitySelectorBarComponent, ChatFabComponent],
})
export class PricesPage {
  private selectedCityService = inject(SelectedCityService);
  private priceService = inject(PriceService);
  private router = inject(Router);

  city = this.selectedCityService.city;
  groupedPrices = signal<{ category: string; items: Price[] }[]>([]);
  loading = signal(false);
  error = signal(false);
  errorMessage = signal('');

  constructor() {
    addIcons({
      addCircleOutline,
      person,
      locationOutline,
    });

    effect(() => {
      const c = this.city();
      if (c) {
        this.loadPrices();
      }
    });
  }

  async loadPrices() {
    const c = this.city();
    if (!c) return;

    this.loading.set(true);
    this.error.set(false);
    this.errorMessage.set('');

    try {
      const res = await firstValueFrom(this.priceService.getPricesByMunicipality(c.id));
      const prices: Price[] = res.content ?? res ?? [];
      this.groupedPrices.set(this.groupByCategory(prices));
    } catch {
      this.error.set(true);
      this.errorMessage.set('Error al cargar los precios');
    } finally {
      this.loading.set(false);
    }
  }

  private groupByCategory(data: Price[]) {
    const map: Record<string, Price[]> = {};
    data.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return Object.keys(map).map((category) => ({
      category,
      items: map[category],
    }));
  }

  goToProfile() {
    localStorage.setItem('account_return_url', '/tabs/prices');
    this.router.navigate(['/tabs/account']);
  }
}
