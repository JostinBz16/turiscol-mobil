import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Booking, BookingStatus } from 'src/app/core/models/Reservations';
import { BookingService } from 'src/app/core/services/booking';
import {
  IonHeader,
  IonButtons,
  IonToolbar,
  IonBackButton,
  IonTitle,
  IonContent,
  IonImg,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Offer } from 'src/app/core/models/Offers';
import { OfferMockService } from 'src/app/core/services/mocks/offer-mock.service';

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
  ],
})
export class ReservationDetailPage implements OnInit {
  booking = signal<Booking | null>(null);
  offer = signal<Offer | null>(null);

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private offerService: OfferMockService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.bookingService.getBookingById(id).subscribe((booking) => {
      if (!booking) return;

      this.booking.set(booking);

      this.offerService.findById(booking.offerId).subscribe((offer) => {
        if (offer) {
          this.offer.set(offer);
        }
      });
    });
  }

  statusLabel(status: BookingStatus): string {
    return {
      CONFIRMED: 'Confirmada',
      PENDING: 'Pendiente',
      CANCELED: 'Cancelada',
    }[status];
  }

  peopleCount() {
    const g = this.booking()?.guests;
    return g ? g.adults + g.children + g.pets : (this.booking()?.quantity ?? 0);
  }

  subtotal() {
    const booking = this.booking();
    const offer = this.offer();
    if (!booking || !offer) return 0;

    if (booking.quantity) {
      return booking.quantity * offer.basePrice;
    }

    const guests = booking.guests;
    return guests ? guests.adults * offer.basePrice : offer.basePrice;
  }

  taxes() {
    return Math.round(this.subtotal() * 0.19);
  }

  total() {
    return this.subtotal() + this.taxes();
  }
}
