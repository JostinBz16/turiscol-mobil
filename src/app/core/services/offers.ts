import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AccommodationOffer,
  EventOffer,
  Offer,
  OfferType,
  ProductOffer,
} from '../models/Offers';
import { HttpClient } from '@angular/common/http';
import { OfferDetailStrategyFactory } from './strategy/offersDetails/OfferDetailStrategyFactory';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private readonly api = '/api/offers';

  constructor(
    private http: HttpClient,
    private factory: OfferDetailStrategyFactory,
  ) {}

  findAll(): Observable<Offer[]> | any {
    // http real
  }

  findAllActive(): Observable<Offer[]> | any {
    // http real
  }

  findAllByType(type: OfferType): Observable<Offer[]> | any {
    // http real
  }

  create(offer: Offer): Observable<Offer> {
    return this.http.post<Offer>(this.api, offer);
  }

  update(id: string, offer: Offer): Observable<Offer> {
    return this.http.put<Offer>(`${this.api}/${id}`, offer);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
  // ----

  getDetail(
    offer: Offer,
  ): Observable<AccommodationOffer | EventOffer | ProductOffer> {
    return this.factory.getStrategy(offer.type).getDetail(offer.id);
  }
}
