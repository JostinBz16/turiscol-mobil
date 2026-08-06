import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Booking, BookingDetail, BookingStatus } from 'src/app/core/models/Reservations';
import { BookingService } from 'src/app/core/services/booking';
import {
  IonHeader,
  IonButtons,
  IonToolbar,
  IonBackButton,
  IonTitle,
  IonContent,
  IonImg,
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Offer, OfferType } from 'src/app/core/models/Offers';
import { OfferService } from 'src/app/core/services/offers';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class ReservationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private offerService = inject(OfferService);
  navService = inject(NavigationService);

  booking = signal<BookingDetail | null>(null);
  offer = signal<Offer | null>(null);
  processingPayment = signal(false);

  OFFER_TYPE_LABEL: Record<OfferType, string> = {
    [OfferType.ACCOMMODATION]: 'Alojamiento',
    [OfferType.EVENT]: 'Evento',
    [OfferType.PRODUCT]: 'Producto',
    [OfferType.SERVICE]: 'Servicio',
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const autoPay = this.route.snapshot.queryParamMap.get('pay') === 'true';

    this.bookingService.getBookingById(id).subscribe((booking) => {
      if (!booking) return;

      console.log('[ReservationDetail] Booking loaded:', JSON.stringify(booking, null, 2));
      console.log('[ReservationDetail] Payments:', booking.payments);
      console.log('[ReservationDetail] StatusHistory:', booking.statusHistory);

      this.booking.set(booking);

      this.offerService.getById(booking.offerId).subscribe({
        next: (offer: any) => {
          if (offer) {
            this.offer.set(offer);
          }
        },
        error: () => {},
      });

      if (autoPay && booking.status === BookingStatus.PENDING_PAYMENT) {
        this.pay();
      }
    });
  }

  isProduct(): boolean {
    return this.offer()?.type === OfferType.PRODUCT;
  }

  canPay(): boolean {
    const b = this.booking();
    return b !== null && b.status === BookingStatus.PENDING_PAYMENT;
  }

  async pay() {
    const b = this.booking();
    if (!b) return;

    this.processingPayment.set(true);

    this.bookingService.checkout(b.id).subscribe({
      next: async (checkout) => {
        this.processingPayment.set(false);

        await Browser.open({ url: checkout.checkoutUrl });

        Browser.addListener('browserFinished', () => {
          this.bookingService.getBookingById(b.id).subscribe((updated) => {
            let status = 'pending';
            if (updated.status === BookingStatus.CONFIRMED) {
              status = 'success';
            } else if (updated.status === BookingStatus.FAILED || updated.status === BookingStatus.CANCELLED) {
              status = 'failure';
            }
            this.router.navigate(['/tabs/account/reservations/payment-result'], {
              queryParams: { status, bookingId: b.id },
            });
          });
        });
      },
      error: (err) => {
        this.processingPayment.set(false);
        console.error('Checkout error', err);
      },
    });
  }

  onPaymentSuccess(data: any) {
    this.router.navigate(['/tabs/account/reservations/payment-result'], {
      queryParams: {
        status: 'success',
        bookingId: this.booking()?.id,
      },
    });
  }

  onPaymentError(error: any) {
    this.router.navigate(['/tabs/account/reservations/payment-result'], {
      queryParams: {
        status: 'failure',
        bookingId: this.booking()?.id,
      },
    });
  }

  statusLabel(status: BookingStatus): string {
    return {
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
      EXPIRED: 'Expirada',
      FAILED: 'Fallida',
    }[status] ?? status;
  }

  statusClass(status: BookingStatus): string {
    return status.toLowerCase().replace('_', '-');
  }

  offerTypeLabel(type: OfferType): string {
    return this.OFFER_TYPE_LABEL[type];
  }

  offerInfoLabel(): string {
    if (!this.booking() || !this.offer()) return '';

    if (this.offer()!.type === OfferType.PRODUCT) {
      return `Unidades`;
    }

    if (this.offer()!.type === OfferType.ACCOMMODATION) {
      return `Noches`;
    }

    if (this.offer()!.type === OfferType.EVENT) {
      return `Entradas`;
    }

    return `Personas`;
  }

  dateLabel(): string {
    if (this.isProduct()) {
      return 'Fecha de compra';
    }
    return 'Fecha del servicio';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  peopleCount() {
    return this.booking()?.quantity ?? 0;
  }

  unitPrice(): number {
    const offer = this.offer() as any;
    if (!offer) return 0;
    if (offer.type === OfferType.ACCOMMODATION) {
      return offer.pricePerNight ?? offer.basePrice ?? 0;
    }
    if (offer.type === OfferType.SERVICE) {
      return offer.pricePerPerson ?? offer.basePrice ?? 0;
    }
    if (offer.type === OfferType.EVENT) {
      return offer.ticketPrice ?? offer.basePrice ?? 0;
    }
    return offer.basePrice ?? 0;
  }

  subtotal() {
    const booking = this.booking();
    if (!booking) return 0;
    return (booking.quantity || 1) * this.unitPrice();
  }

  taxes() {
    return Math.round(this.subtotal() * 0.19);
  }

  total() {
    return this.subtotal() + this.taxes();
  }

  hasPayment(): boolean {
    return (this.booking()?.payments?.length ?? 0) > 0;
  }

  getPayment() {
    return this.booking()?.payments?.[0] ?? null;
  }

  isConfirmed(): boolean {
    return this.booking()?.status === BookingStatus.CONFIRMED;
  }

  paymentStatusLabel(status: string): string {
    return {
      PAID: 'Pagado',
      PENDING: 'Pendiente',
      FAILED: 'Fallido',
      REFUNDED: 'Reembolsado',
    }[status] ?? status;
  }

  paymentStatusClass(status: string): string {
    return {
      PAID: 'paid',
      PENDING: 'pending',
      FAILED: 'failed',
      REFUNDED: 'refunded',
    }[status] ?? '';
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  statusHistoryLabel(status: string): string {
    return {
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmada',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
      EXPIRED: 'Expirada',
      FAILED: 'Fallida',
    }[status] ?? status;
  }

  statusHistoryClass(status: string): string {
    return {
      PENDING_PAYMENT: 'pending',
      CONFIRMED: 'confirmed',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      EXPIRED: 'expired',
      FAILED: 'failed',
    }[status] ?? '';
  }
}
