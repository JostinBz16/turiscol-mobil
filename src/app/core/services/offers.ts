import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
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
  private http = inject(HttpClient);
  private factory = inject(OfferDetailStrategyFactory);

  private readonly api = `${environment.apiUrl}/offers`;

  findAll(params?: { page?: number; size?: number; providerId?: string; cityId?: string; active?: boolean }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);

    let url = this.api;
    if (params?.providerId) {
      url = `${this.api}/provider/${params.providerId}`;
    } else if (params?.cityId) {
      if (params?.active) {
        url = `${this.api}/city/${params.cityId}/active`;
      } else {
        url = `${this.api}/city/${params.cityId}`;
      }
    }

    return this.http.get<any>(url, { params: httpParams }).pipe(
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

  search(filters: {
    providerId?: string;
    cityId?: string;
    active?: boolean;
    name?: string;
    type?: string;
    category?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    maxGuests?: number;
    allowPets?: boolean;
    allowChildren?: boolean;
    startDate?: string;
    endDate?: string;
    capacity?: number;
    page?: number;
    size?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (filters.providerId) httpParams = httpParams.set('providerId', filters.providerId);
    if (filters.cityId) httpParams = httpParams.set('cityId', filters.cityId);
    if (filters.active !== undefined) httpParams = httpParams.set('active', filters.active);
    if (filters.name) httpParams = httpParams.set('name', filters.name);
    if (filters.type) httpParams = httpParams.set('type', filters.type);
    if (filters.category) httpParams = httpParams.set('category', filters.category);
    if (filters.featured !== undefined) httpParams = httpParams.set('featured', filters.featured);
    if (filters.minPrice !== undefined) httpParams = httpParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', filters.maxPrice);
    if (filters.maxGuests !== undefined) httpParams = httpParams.set('maxGuests', filters.maxGuests);
    if (filters.allowPets !== undefined) httpParams = httpParams.set('allowPets', filters.allowPets);
    if (filters.allowChildren !== undefined) httpParams = httpParams.set('allowChildren', filters.allowChildren);
    if (filters.startDate) httpParams = httpParams.set('startDate', filters.startDate);
    if (filters.endDate) httpParams = httpParams.set('endDate', filters.endDate);
    if (filters.capacity !== undefined) httpParams = httpParams.set('capacity', filters.capacity);
    if (filters.page !== undefined) httpParams = httpParams.set('page', filters.page);
    if (filters.size !== undefined) httpParams = httpParams.set('size', filters.size);
    return this.http.get<any>(`${this.api}/search`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error searching offers', err);
        return throwError(() => err);
      }),
    );
  }

  activate(id: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}/activate`, {}).pipe(
      catchError((err) => {
        console.error('Error activating offer', err);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: string): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}/deactivate`, {}).pipe(
      catchError((err) => {
        console.error('Error deactivating offer', err);
        return throwError(() => err);
      }),
    );
  }

  getByCityActive(cityId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/city/${cityId}/active`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching active offers by city', err);
        return throwError(() => err);
      }),
    );
  }

  findByTypeAndCategory(type: OfferType, category: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/type/${type}/category/${category}`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching offers by type and category', err);
        return throwError(() => err);
      }),
    );
  }

  getFeatured(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/featured`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching featured offers', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<Offer> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map((item) => ({
        ...item,
        images: item.images?.map((img: any) => img.imageUrl) ?? [],
        basePrice: item.baseprice ?? item.basePrice,
      })),
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
