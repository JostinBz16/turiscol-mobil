import { Component, OnInit, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Booking, BookingStatus } from 'src/app/core/models/Reservations';
import { BookingService } from 'src/app/core/services/booking';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.page.html',
  styleUrls: ['./reservations.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    CommonModule,
  ],
})
export class ReservationsPage implements OnInit {
  bookings = signal<Booking[]>([]);

  constructor(
    private bookingService: BookingService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.bookingService.getBookings().subscribe((data) => {
      this.bookings.set(data);
    });
  }

  goToDetail(id: number) {
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
