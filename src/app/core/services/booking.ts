import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Booking, BookingDetail } from '../models/Reservations';
import { BookingResponseDto } from '../DTO/BookingResponseDto';
import { BookingDetailResponseDto } from '../DTO/BookingDetailResponseDto';
import {
  toBooking,
  toBookingDetail,
  toCreateBookingRequestDto,
  toUpdateBookingRequestDto,
} from '../adapters/BookingAdapter';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private http = inject(HttpClient);

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

  getProviderBookings(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http
      .get<{ content: BookingResponseDto[] }>(`${this.api}/provider`, { params: httpParams })
      .pipe(
        map((res) => ({
          ...res,
          content: (res.content ?? []).map(toBooking),
        })),
        catchError((err) => {
          console.error('Error fetching provider bookings', err);
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
}

export interface CheckoutResponse {
  checkoutUrl: string;
  amount: number;
  currency: string;
}
