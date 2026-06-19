import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Price } from 'src/app/core/models/Price';
import { PriceService } from 'src/app/core/services/price';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-price-list',
  standalone: true,
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
  imports: [
    CommonModule,
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
  private route = inject(ActivatedRoute);
  private priceService = inject(PriceService);

  cityId!: string;
  cityName = '';
  prices: Price[] = [];

  ngOnInit() {
    this.cityId = this.route.snapshot.paramMap.get('cityId') || '';
    this.loadPrices();
  }

  async loadPrices() {
    const res = await firstValueFrom(this.priceService.getPricesByMunicipality(this.cityId));
    this.prices = res.content ?? res;
    this.cityName = 'Lista de Precios';
  }
}
