import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-price-list',
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
  cityId!: string;
  cityName = '';
  prices: Price[] = [];

  constructor(
    private route: ActivatedRoute,
    private priceService: PriceService,
  ) {}

  ngOnInit() {
    this.cityId = this.route.snapshot.paramMap.get('cityId') || '';
    this.loadPrices();
  }

  loadPrices() {
    this.prices = this.priceService.getPricesByMunicipality(this.cityId);
    // Note: cityName logic might need a separate lookup if not in Price model
    this.cityName = 'Lista de Precios';
  }
}
