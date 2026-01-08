import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BOOKINGS_MOCK } from '../data/BookingMock';
import { Booking } from '../models/Reservations';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor() {}

  getBookings(): Observable<Booking[]> {
    return of(BOOKINGS_MOCK);
  }

  getBookingById(id: number): Observable<Booking | undefined> {
    const booking = BOOKINGS_MOCK.find((b) => b.id === id);
    return of(booking);
  }
}
