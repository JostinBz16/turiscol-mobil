import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import {
  AccommodationOffer,
  EventOffer,
  Offer,
  OfferType,
  ProductOffer,
} from '../models/Offers';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OfferDetailStrategyFactory } from './strategy/offersDetails/OfferDetailStrategyFactory';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private readonly api = `${environment.apiUrl}/offers`;

  constructor(
    private http: HttpClient,
    private factory: OfferDetailStrategyFactory,
  ) {}

  findAll(params?: { page?: number; size?: number; providerId?: string; cityId?: string }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    if (params?.providerId) httpParams = httpParams.set('providerId', params.providerId);
    if (params?.cityId) httpParams = httpParams.set('cityId', params.cityId);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching offers', err);
        return throwError(() => err);
      }),
    );
  }

  findAllActive(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/active`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching active offers', err);
        return throwError(() => err);
      }),
    );
  }

  findAllByType(type: OfferType, params?: { page?: number; size?: number; active?: boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    const suffix = params?.active ? '/active' : '';
    return this.http.get<any>(`${this.api}/type/${type}${suffix}`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching offers by type', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<Offer> {
    return this.http.get<Offer>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching offer detail', err);
        return throwError(() => err);
      }),
    );
  }

  create(offer: Offer): Observable<Offer> {
    return this.http.post<Offer>(this.api, offer).pipe(
      catchError((err) => {
        console.error('Error creating offer', err);
        return throwError(() => err);
      }),
    );
  }

  update(id: string, offer: Offer): Observable<Offer> {
    return this.http.put<Offer>(`${this.api}/${id}`, offer).pipe(
      catchError((err) => {
        console.error('Error updating offer', err);
        return throwError(() => err);
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting offer', err);
        return throwError(() => err);
      }),
    );
  }

  getDetail(
    offer: Offer,
  ): Observable<AccommodationOffer | EventOffer | ProductOffer> {
    return this.factory.getStrategy(offer.type).getDetail(offer.id);
  }
}
