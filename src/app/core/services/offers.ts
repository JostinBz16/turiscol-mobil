import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Offer, OfferType } from '../models/Offers';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private offers$ = new BehaviorSubject<Offer[]>([]);

  getAll() {
    return this.offers$.asObservable();
  }

  getById(id: string): Offer | undefined {
    return this.offers$.value.find((o) => o.id === id);
  }

  getByType(type: OfferType): Offer[] {
    return this.offers$.value.filter((o) => o.type === type);
  }

  getByCity(cityId: number): Offer[] {
    return this.offers$.value.filter((o) => o.cityId === cityId);
  }

  getActive(): Offer[] {
    return this.offers$.value.filter((o) => o.active);
  }
}
