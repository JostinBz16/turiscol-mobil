import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap, catchError, throwError } from 'rxjs';
import { BookingService, CheckoutResponse } from './booking';
import { environment } from 'src/environments/environment';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private bookingService = inject(BookingService);
  private mp: any = null;

  loadSdk(): Observable<void> {
    return from(this.loadMercadoPagoSdk());
  }

  private loadMercadoPagoSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error loading MercadoPago SDK'));
      document.body.appendChild(script);
    });
  }

  createBrick(containerId: string, amount: number, currency: string, callbacks: {
    onFormReady?: () => void;
    onSubmit?: (form: any) => void;
    onError?: (error: any) => void;
  }): any {
    if (!window.MercadoPago) {
      throw new Error('MercadoPago SDK not loaded');
    }

    this.mp = new window.MercadoPago(environment.mercadoPagoPublicKey, {
      locale: 'es-CO',
    });

    const bricks = this.mp.bricks();

    const renderPaymentBrick = async (bricksController: any) => {
      const settings = {
        initialization: {
          amount: amount,
          currency: currency || 'COP',
        },
        customization: {
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            bankTransfer: 'all',
            wallet: 'all',
          },
          visual: {
            style: {
              theme: 'default',
            },
          },
        },
        callbacks: {
          onReady: () => {
            callbacks.onFormReady?.();
          },
          onSubmit: (form: any) => {
            callbacks.onSubmit?.(form);
          },
          onError: (error: any) => {
            callbacks.onError?.(error);
          },
        },
      };

      return bricksController.create('payment', 'mp-payment-brick', settings);
    };

    return renderPaymentBrick(bricks);
  }

  checkout(bookingId: number): Observable<CheckoutResponse> {
    return this.bookingService.checkout(bookingId).pipe(
      catchError((err) => {
        console.error('Checkout failed', err);
        return throwError(() => err);
      }),
    );
  }

  destroyBrick(): void {
    const brickContainer = document.getElementById('mp-payment-brick');
    if (brickContainer) {
      brickContainer.innerHTML = '';
    }
  }
}
