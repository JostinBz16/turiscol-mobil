import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Offer, OfferType } from '../../models/Offers';
import { offersMock } from '../../data/ProductMock';
import { OfferDetailStrategyFactory } from '../strategy/offersDetails/OfferDetailStrategyFactory';

@Injectable({ providedIn: 'root' })
export class OfferMockService {
  constructor(private factory: OfferDetailStrategyFactory) {}

  findAll(): Observable<Offer[]> {
    return of(offersMock);
  }

  findById(id: string): Observable<Offer | null> {
    const offer = offersMock.find((o) => o.id === id);
    return of(offer || null);
  }

  findAllActive(): Observable<Offer[]> {
    return of(offersMock.filter((o) => o.active));
  }

  findAllByType(type: OfferType): Observable<Offer[]> {
    return of(offersMock.filter((o) => o.type === type && o.active));
  }

  getDetail(offer: Offer): Observable<any> {
    return this.factory.getStrategy(offer.type).getDetail(offer.id);
  }
}
