import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, of, throwError, firstValueFrom } from 'rxjs';
import { Booking, BookingDetail } from '../models/Reservations';
import { BookingResponseDto } from '../DTO/BookingResponseDto';
import { BookingDetailResponseDto } from '../DTO/BookingDetailResponseDto';
import { ProviderDashboardDto } from '../DTO/ProviderDashboardDto';
import {
  toBooking,
  toBookingDetail,
  toCreateBookingRequestDto,
  toUpdateBookingRequestDto,
} from '../adapters/BookingAdapter';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { OfferService } from './offers';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);
  private offerService = inject(OfferService);

  private readonly api = `${environment.apiUrl}/booking`;

  getBookings(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http
      .get<{ content: BookingResponseDto[] }>(this.api, { params: httpParams })
      .pipe(
        map((res) => ({
          ...res,
          content: (res.content ?? []).map(toBooking),
        })),
        catchError((err) => {
          console.error('Error fetching bookings', err);
          return throwError(() => err);
        }),
      );
  }

  getProviderBookings(params?: { page?: number; size?: number }): Observable<{ content: Booking[] }> {
    return from(this.fetchProviderBookings()).pipe(
      map((content) => ({ content })),
      catchError((err) => {
        console.error('Error fetching provider bookings', err);
        return throwError(() => err);
      }),
    );
  }

  private async fetchProviderBookings(params?: { page?: number; size?: number }): Promise<Booking[]> {
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    const offersRes = await firstValueFrom(
      this.offerService.findAll({ providerId: userId, page: 0, size: 100 }),
    );
    const offers = offersRes.content ?? [];
    if (offers.length === 0) return [];

    const offerIds = new Set(offers.map((o: any) => String(o.id)));
    const offerById = new Map(offers.map((o: any) => [String(o.id), o]));

    let httpParams = new HttpParams();
    httpParams = httpParams.set('size', String(params?.size ?? 1000));
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);

    const res = await firstValueFrom(
      this.http.get<{ content: BookingResponseDto[] }>(this.api, { params: httpParams }),
    );
    const all = res.content ?? [];
    return all
      .filter((b) => offerIds.has(String(b.offerId)))
      .map((b) => {
        const offer = offerById.get(String(b.offerId)) as any;
        return {
          ...toBooking(b),
          offerName: b.offerName ?? offer?.name,
          offerImage: offer?.images?.[0]?.imageUrl ?? offer?.images?.[0] ?? '',
        } as Booking;
      });
  }

  getProviderDashboard(): Observable<ProviderDashboardDto> {
    return this.http.get<ProviderDashboardDto>(`${environment.apiUrl}/providers/dashboard`).pipe(
      catchError((err) => {
        console.error('Error fetching provider dashboard', err);
        return throwError(() => err);
      }),
    );
  }

  getUserBookings(userId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http
      .get<{ content: BookingResponseDto[] }>(`${this.api}/user/${userId}`, { params: httpParams })
      .pipe(
        map((res) => ({
          ...res,
          content: (res.content ?? []).map(toBooking),
        })),
        catchError((err) => {
          console.error('Error fetching user bookings', err);
          return throwError(() => err);
        }),
      );
  }

  getBookingById(id: number | string): Observable<BookingDetail> {
    return this.http
      .get<BookingDetailResponseDto>(`${this.api}/${id}`)
      .pipe(
        map(toBookingDetail),
        catchError((err) => {
          console.error('Error fetching booking detail', err);
          return throwError(() => err);
        }),
      );
  }

  createBooking(payload: {
    offerId: string;
    startDate: string;
    endDate?: string;
    quantity: number;
    guestCount?: number;
  }): Observable<Booking> {
    const userId = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).id
      : '';
    const idempotencyKey = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
    const headers = new HttpHeaders({
      'X-User-Id': userId,
      'Idempotency-Key': idempotencyKey,
    });
    const dto = toCreateBookingRequestDto(payload);
    return this.http
      .post<BookingResponseDto>(this.api, dto, { headers })
      .pipe(
        map(toBooking),
        catchError((err) => {
          console.error('Error creating booking', err);
          return throwError(() => err);
        }),
      );
  }

  updateBooking(id: number | string, payload: Partial<Booking>): Observable<Booking> {
    const dto = toUpdateBookingRequestDto({
      startDate: payload.startDate,
      endDate: payload.endDate,
      quantity: payload.quantity,
    });
    return this.http
      .put<BookingResponseDto>(`${this.api}/${id}`, dto)
      .pipe(
        map(toBooking),
        catchError((err) => {
          console.error('Error updating booking', err);
          return throwError(() => err);
        }),
      );
  }

  checkout(bookingId: number | string): Observable<CheckoutResponse> {
    const userId = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).id
      : '';
    const headers = new HttpHeaders({ 'X-User-Id': userId });
    return this.http
      .post<CheckoutResponse>(`${this.api}/${bookingId}/checkout`, {}, { headers })
      .pipe(
        catchError((err) => {
          console.error('Error during checkout', err);
          return throwError(() => err);
        }),
      );
  }

  cancelBooking(id: number | string): Observable<Booking> {
    const userId = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')!).id
      : '';
    const headers = new HttpHeaders({ 'X-User-Id': userId });
    return this.http
      .post<BookingResponseDto>(`${this.api}/${id}/cancel`, {}, { headers })
      .pipe(
        map(toBooking),
        catchError((err) => {
          console.error('Error cancelling booking', err);
          return throwError(() => err);
        }),
      );
  }

  requestCompletion(id: number | string): Observable<Booking> {
    const headers = new HttpHeaders({ 'X-User-Id': this.getCurrentUserId() });
    return this.http
      .post<BookingResponseDto>(`${this.api}/${id}/complete-request`, {}, { headers })
      .pipe(
        map(toBooking),
        catchError((err) => {
          console.error('Error requesting completion', err);
          return throwError(() => err);
        }),
      );
  }

  confirmCompletion(id: number | string): Observable<Booking> {
    const headers = new HttpHeaders({ 'X-User-Id': this.getCurrentUserId() });
    return this.http
      .post<BookingResponseDto>(`${this.api}/${id}/confirm-completion`, {}, { headers })
      .pipe(
        map(toBooking),
        catchError((err) => {
          console.error('Error confirming completion', err);
          return throwError(() => err);
        }),
      );
  }

  private getCurrentUserId(): string {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw).id ?? '') : '';
  }

  getBlockedDates(offerId: string): Observable<string[]> {
    return this.http
      .get<string[]>(`${environment.apiUrl}/offers/${offerId}/blocked-dates`)
      .pipe(
        catchError(() => of([])),
      );
  }
}

export interface CheckoutResponse {
  checkoutUrl: string;
  amount: number;
  currency: string;
}
