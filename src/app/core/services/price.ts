import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Price } from '../models/Price';
import { pricesMock } from '../data/PriceMock';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private prices$ = new BehaviorSubject<Price[]>(pricesMock);

  getPricesByMunicipality(municipalityId: string) {
    return this.prices$.value.filter((p) => p.municipalityId === municipalityId);
  }

  getAll() {
    return this.prices$.asObservable();
  }
}
