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
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reservation-detail',
  templateUrl: './reservation-detail.page.html',
  styleUrls: ['./reservation-detail.page.scss'],
  standalone: true,
  imports: [
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

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.bookingService.getBookingById(id).subscribe((data) => {
      if (data) {
        this.booking.set(data);
      }
    });
  }

  statusLabel(status: BookingStatus): string {
    return {
      CONFIRMED: 'Confirmada',
      PENDING: 'Pendiente',
      CANCELED: 'Cancelada',
    }[status];
  }
}
