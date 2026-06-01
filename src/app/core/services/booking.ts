import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Booking, BookingDetail } from '../models/Reservations';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly api = `${environment.apiUrl}/booking`;

  constructor(private http: HttpClient) {}

  getBookings(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching bookings', err);
        return throwError(() => err);
      }),
    );
  }

  getUserBookings(userId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/user/${userId}`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching user bookings', err);
        return throwError(() => err);
      }),
    );
  }

  getBookingById(id: number | string): Observable<BookingDetail> {
    return this.http.get<BookingDetail>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching booking detail', err);
        return throwError(() => err);
      }),
    );
  }

  createBooking(booking: any): Observable<any> {
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
    return this.http.post<any>(this.api, booking, { headers }).pipe(
      catchError((err) => {
        console.error('Error creating booking', err);
        return throwError(() => err);
      }),
    );
  }

  updateBooking(id: number | string, booking: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.api}/${id}`, booking).pipe(
      catchError((err) => {
        console.error('Error updating booking', err);
        return throwError(() => err);
      }),
    );
  }
}
