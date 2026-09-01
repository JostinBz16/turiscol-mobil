import { Component, computed, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonBackButton,
  IonImg,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonChip,
  IonIcon,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Booking, BookingStatus } from 'src/app/core/models/Reservations';
import { BookingService } from 'src/app/core/services/booking';
import { OfferService } from 'src/app/core/services/offers';
import { Offer } from 'src/app/core/models/Offers';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Browser } from '@capacitor/browser';
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonBackButton,
    IonContent,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonChip,
    IonIcon,
    IonButton,
    IonSpinner,
    ChatFabComponent,
  ],
})
export class ReservationsPage implements OnInit {
  private bookingService = inject(BookingService);
  private offerService = inject(OfferService);
  private router = inject(Router);
  private navService = inject(NavigationService);

  bookings = signal<Booking[]>([]);
  offersByBooking = signal<Offer[]>([]);
  loading = signal(true);
  filtroActivo = signal<BookingStatus | 'ALL'>('ALL');
  processingBookingId = signal<number | null>(null);

  readonly filtroOptions: { label: string; value: BookingStatus | 'ALL' }[] = [
    { label: 'Todas', value: 'ALL' },
    { label: 'Pendiente', value: BookingStatus.PENDING_PAYMENT },
    { label: 'Confirmada', value: BookingStatus.CONFIRMED },
    { label: 'Completada', value: BookingStatus.COMPLETED },
    { label: 'Cancelada', value: BookingStatus.CANCELLED },
  ];

  bookingsWithOffers = computed<BookingWithOffer[]>(() => {
    const offersMap = new Map(this.offersByBooking().map((o) => [o.id, o]));
    const filtro = this.filtroActivo();

    return this.bookings()
      .filter((b) => filtro === 'ALL' || b.status === filtro)
      .map((booking) => {
        const offer = offersMap.get(booking.offerId);
        return offer ? { booking, offer } : null;
      })
      .filter(Boolean) as BookingWithOffer[];
  });

  ngOnInit() {
    this.loading.set(true);
    this.bookingService.getBookings().pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe((res) => {
      const bookings: Booking[] = res.content ?? res;
      this.bookings.set(bookings);

      if (bookings.length === 0) return;

      const requests = bookings.map((b: Booking) =>
        this.offerService.getById(b.offerId),
      );

      forkJoin(requests).subscribe((offers: any) => {
        this.offersByBooking.set((offers ?? []).filter(Boolean) as Offer[]);
      });
    });
  }

  setFiltro(status: BookingStatus | 'ALL') {
    this.filtroActivo.set(status);
  }

  goToDetail(id: number) {
    this.navService.setReturnUrl('/tabs/account/reservations');
    this.router.navigate(['/tabs/account/reservations/detail', id]);
  }

  goToExplore() {
    this.router.navigate(['/tabs/offers']);
  }

  isProcessing(bookingId: number): boolean {
    return this.processingBookingId() === bookingId;
  }

  async pay(event: Event, booking: Booking) {
    event.stopPropagation();
    if (this.processingBookingId()) return;

    this.processingBookingId.set(booking.id);

    this.bookingService.checkout(booking.id).subscribe({
      next: async (checkout) => {
        await Browser.open({ url: checkout.checkoutUrl });

        Browser.addListener('browserFinished', () => {
          this.processingBookingId.set(null);
          this.reloadBookings();
        });
      },
      error: (err) => {
        this.processingBookingId.set(null);
        console.error('Checkout error', err);
      },
    });
  }

  private reloadBookings() {
    this.loading.set(true);
    this.bookingService.getBookings().pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe((res) => {
      const bookings: Booking[] = res.content ?? res;
      this.bookings.set(bookings);

      if (bookings.length === 0) return;

      const requests = bookings.map((b: Booking) =>
        this.offerService.getById(b.offerId),
      );

      forkJoin(requests).subscribe((offers: any) => {
        this.offersByBooking.set((offers ?? []).filter(Boolean) as Offer[]);
      });
    });
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

  statusClass(status: BookingStatus): string {
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

  offerTypeLabel(type: string): string {
    const map: Record<string, string> = {
      accommodation: 'Alojamiento',
      event: 'Evento',
      service: 'Servicio',
      product: 'Producto',
    };
    return map[type] ?? type;
  }

  offerPrice(offer: any): number {
    if (offer.type === 'accommodation') {
      return offer.pricePerNight ?? offer.basePrice ?? 0;
    }
    if (offer.type === 'service') {
      return offer.pricePerPerson ?? offer.basePrice ?? 0;
    }
    if (offer.type === 'event') {
      return offer.ticketPrice ?? offer.basePrice ?? 0;
    }
    return offer.basePrice ?? 0;
  }
}

type BookingWithOffer = {
  booking: Booking;
  offer: Offer;
};
