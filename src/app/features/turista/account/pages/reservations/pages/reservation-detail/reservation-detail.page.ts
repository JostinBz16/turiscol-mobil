import { Component, OnInit, signal, inject } from '@angular/core';
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
import { Offer, OfferType } from 'src/app/core/models/Offers';
import { OfferService } from 'src/app/core/services/offers';
import { NavigationService } from 'src/app/core/services/navigation.service';

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
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
  private offerService = inject(OfferService);
  navService = inject(NavigationService);

  booking = signal<Booking | null>(null);
  offer = signal<Offer | null>(null);

  OFFER_TYPE_LABEL: Record<OfferType, string> = {
    [OfferType.ACCOMMODATION]: 'Alojamiento',
    [OfferType.EVENT]: 'Evento',
    [OfferType.PRODUCT]: 'Producto',
    [OfferType.SERVICE]: 'Servicio',
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.bookingService.getBookingById(id).subscribe((booking) => {
      if (!booking) return;

      this.booking.set(booking);

      this.offerService.getById(booking.offerId).subscribe((offer: any) => {
        if (offer) {
          this.offer.set(offer);
        }
      });
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

  offerTypeLabel(type: OfferType): string {
    return this.OFFER_TYPE_LABEL[type];
  }

  offerInfoLabel(): string {
    if (!this.booking() || !this.offer()) return '';

    if (this.offer()!.type === OfferType.PRODUCT) {
      return `Cantidad`;
    }

    return `Personas`;
  }

  peopleCount() {
    return this.booking()?.quantity ?? 0;
  }

  subtotal() {
    const booking = this.booking();
    const offer = this.offer();
    if (!booking || !offer) return 0;

    return (booking.quantity || 1) * offer.basePrice;
  }

  taxes() {
    return Math.round(this.subtotal() * 0.19);
  }

  total() {
    return this.subtotal() + this.taxes();
  }
}
