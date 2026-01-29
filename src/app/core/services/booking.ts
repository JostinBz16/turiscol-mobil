import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Booking } from '../models/Reservations';
import { bookingsMock } from '../data/BookingMock';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  constructor() {}

  getBookings(): Observable<Booking[]> {
    return of(bookingsMock);
  }

  getBookingById(id: number): Observable<Booking | undefined> {
    const booking = bookingsMock.find((b) => b.id === id);
    return of(booking);
  }
}
