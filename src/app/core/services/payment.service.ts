import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { BookingService, CheckoutResponse } from './booking';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private bookingService = inject(BookingService);

  checkout(bookingId: number): Observable<CheckoutResponse> {
    return this.bookingService.checkout(bookingId).pipe(
      catchError((err) => {
        console.error('Checkout failed', err);
        return throwError(() => err);
      }),
    );
  }
}
