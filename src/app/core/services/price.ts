import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Price } from '../models/Price';
import { prices } from '../data/PriceMock';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private prices$ = new BehaviorSubject<Price[]>(prices);

  getPricesByCity(cityId: string) {
    return this.prices$.value.find((p) => p.cityId === cityId);
  }

  getAll() {
    return this.prices$.asObservable();
  }
}
