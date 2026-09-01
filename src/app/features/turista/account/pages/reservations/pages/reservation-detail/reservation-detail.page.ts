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
  IonChip,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Offer, OfferType } from 'src/app/core/models/Offers';
import { OfferService } from 'src/app/core/services/offers';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Browser } from '@capacitor/browser';
import { firstValueFrom } from 'rxjs';
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';

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
    IonChip,
    ChatFabComponent,
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
  loading = true;
  error = false;
  errorMessage = '';
  processingPayment = signal(false);
  actionLoading = false;

  OFFER_TYPE_LABEL: Record<OfferType, string> = {
    [OfferType.ACCOMMODATION]: 'Alojamiento',
    [OfferType.EVENT]: 'Evento',
    [OfferType.PRODUCT]: 'Producto',
    [OfferType.SERVICE]: 'Servicio',
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const autoPay = this.route.snapshot.queryParamMap.get('pay') === 'true';

    this.bookingService.getBookingById(id).subscribe({
      next: (booking) => {
        if (!booking) return;
        this.booking.set(booking);
        this.loading = false;

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
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.errorMessage = 'No se pudo cargar la reserva';
      },
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

  async confirmCompletion() {
    const b = this.booking();
    if (!b) return;

    this.actionLoading = true;
    try {
      const updated = await firstValueFrom(this.bookingService.confirmCompletion(b.id));
      this.booking.set({ ...b, status: updated.status as BookingStatus });
    } catch (err) {
      this.errorMessage = 'No se pudo confirmar la completación';
      console.error('Error confirming completion', err);
    }
    this.actionLoading = false;
  }

  canConfirmCompletion(): boolean {
    return this.booking()?.status === BookingStatus.COMPLETION_REQUESTED;
  }

  statusLabel(status: BookingStatus): string {
    return {
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmada',
      COMPLETION_REQUESTED: 'En completación',
      CANCELLED: 'Cancelada',
      COMPLETED: 'Completada',
      EXPIRED: 'Expirada',
      FAILED: 'Fallida',
    }[status] ?? status;
  }

  statusChipColor(status: BookingStatus): string {
    return {
      PENDING_PAYMENT: 'warning',
      CONFIRMED: 'primary',
      COMPLETION_REQUESTED: 'tertiary',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      EXPIRED: 'medium',
      FAILED: 'danger',
    }[status] ?? 'medium';
  }

  offerTypeLabel(type?: OfferType): string {
    if (!type) return 'Oferta';
    return this.OFFER_TYPE_LABEL[type] ?? type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  hasPayment(): boolean {
    return (this.booking()?.payments?.length ?? 0) > 0;
  }

  getPayment() {
    return this.booking()?.payments?.[0] ?? null;
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
    return new Date(dateStr).toLocaleDateString('es-CO', {
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
      COMPLETION_REQUESTED: 'En completación',
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
      COMPLETION_REQUESTED: 'completion-requested',
      CANCELLED: 'cancelled',
      COMPLETED: 'completed',
      EXPIRED: 'expired',
      FAILED: 'failed',
    }[status] ?? '';
  }

  get firstImage(): string {
    return this.offer()?.images?.[0] ?? '';
  }

  get formattedTotal(): string {
    const b = this.booking();
    return b && b.totalAmount ? Number(b.totalAmount).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }) : '';
  }
}
