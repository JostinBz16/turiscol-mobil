import { Component, computed, OnInit, signal, Signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonBackButton,
  IonImg,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Booking, BookingStatus } from 'src/app/core/models/Reservations';
import { BookingService } from 'src/app/core/services/booking';
import { OfferService } from 'src/app/core/services/offers';
import { Offer } from 'src/app/core/models/Offers';
import { forkJoin } from 'rxjs';
import { NavigationService } from 'src/app/core/services/navigation.service';

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
  ],
})
export class ReservationsPage implements OnInit {
  private bookingService = inject(BookingService);
  private offerService = inject(OfferService);
  private router = inject(Router);
  private navService = inject(NavigationService);

  bookings = signal<Booking[]>([]);
  offersByBooking = signal<Offer[]>([]);

  bookingsWithOffers = computed<BookingWithOffer[]>(() => {
    const offersMap = new Map(this.offersByBooking().map((o) => [o.id, o]));

    return this.bookings()
      .map((booking) => {
        const offer = offersMap.get(booking.offerId);
        return offer ? { booking, offer } : null;
      })
      .filter(Boolean) as BookingWithOffer[];
  });

  ngOnInit() {
    this.bookingService.getBookings().subscribe((res) => {
      const bookings: Booking[] = res.content ?? res;
      this.bookings.set(bookings);

      const requests = bookings.map((b: Booking) =>
        this.offerService.getById(b.offerId),
      );

      forkJoin(requests).subscribe((offers: any) => {
        this.offersByBooking.set((offers ?? []).filter(Boolean) as Offer[]);
      });
    });
  }

  goToDetail(id: number) {
    this.navService.setReturnUrl('/tabs/account/reservations');
    this.router.navigate(['/tabs/account/reservations/detail', id]);
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
}

type BookingWithOffer = {
  booking: Booking;
  offer: Offer;
};
