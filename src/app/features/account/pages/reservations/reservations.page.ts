import { Component, computed, OnInit, signal, Signal } from '@angular/core';
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
import { OfferMockService } from 'src/app/core/services/mocks/offer-mock.service';
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

  constructor(
    private bookingService: BookingService,
    private offerService: OfferMockService,
    private router: Router,
    private navService: NavigationService,
  ) {}

  ngOnInit() {
    this.bookingService.getBookings().subscribe((bookings) => {
      this.bookings.set(bookings);

      const requests = bookings.map((b) =>
        this.offerService.findById(b.offerId),
      );

      forkJoin(requests).subscribe((offers) => {
        this.offersByBooking.set(offers.filter(Boolean) as Offer[]);
      });
    });
  }

  goToDetail(id: number) {
    this.navService.setReturnUrl('/tabs/account/reservations');
    this.router.navigate(['/tabs/account/reservations/detail', id]);
  }

  statusLabel(status: BookingStatus): string {
    return {
      CONFIRMED: 'Confirmada',
      PENDING: 'Pendiente',
      CANCELED: 'Cancelada',
    }[status];
  }
}

type BookingWithOffer = {
  booking: Booking;
  offer: Offer;
};
