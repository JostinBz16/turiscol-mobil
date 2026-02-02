import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Offer, OfferType } from '../../models/Offers';
import { offersMock } from '../../data/ProductMock';
import { OfferDetailStrategyFactory } from '../strategy/offersDetails/OfferDetailStrategyFactory';

@Injectable({ providedIn: 'root' })
export class OfferMockService {
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
}
