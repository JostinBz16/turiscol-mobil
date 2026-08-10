import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonButtons, IonToolbar, IonTitle, IonBackButton, IonContent,
  IonImg, IonButton, IonIcon, IonSpinner, IonChip,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, storefrontOutline, checkmarkDoneOutline, alertCircleOutline,
  calendarOutline, cubeOutline, receiptOutline, timeOutline, peopleOutline, cardOutline,
} from 'ionicons/icons';
import { Booking, BookingDetail, BookingStatus } from 'src/app/core/models/Reservations';
import { BookingService } from 'src/app/core/services/booking';
import { OfferService } from 'src/app/core/services/offers';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-provider-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonButtons, IonToolbar, IonTitle, IonBackButton, IonContent,
    IonImg, IonButton, IonIcon, IonSpinner, IonChip,
  ],
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
})
export class ProviderBookingDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);
  private offerService = inject(OfferService);
  navService = inject(NavigationService);

  booking = signal<BookingDetail | null>(null);
  offer = signal<any>(null);
  loading = true;
  error = false;
  errorMessage = '';
  actionLoading = false;

  constructor() {
    addIcons({
      chevronBackOutline, storefrontOutline, checkmarkDoneOutline, alertCircleOutline,
      calendarOutline, cubeOutline, receiptOutline, timeOutline, peopleOutline, cardOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.errorMessage = 'Reserva no encontrada';
      this.loading = false;
      return;
    }
    this.loadBooking(Number(id));
  }

  private async loadBooking(id: number) {
    this.loading = true;
    this.error = false;
    try {
      const booking = await firstValueFrom(this.bookingService.getBookingById(id));
      this.booking.set(booking);
      if (booking.offerId) {
        try {
          this.offer.set(await firstValueFrom(this.offerService.getById(booking.offerId)));
        } catch { }
      }
    } catch {
      this.error = true;
      this.errorMessage = 'No se pudo cargar la venta';
    }
    this.loading = false;
  }

  async requestCompletion() {
    const b = this.booking();
    if (!b) return;
    this.actionLoading = true;
    try {
      const updated = await firstValueFrom(this.bookingService.requestCompletion(b.id));
      this.booking.set({ ...b, status: updated.status as BookingStatus });
    } catch (err) {
      this.errorMessage = 'No se pudo solicitar la completación';
      console.error('Error requesting completion', err);
    }
    this.actionLoading = false;
  }

  canRequestCompletion(): boolean {
    const b = this.booking();
    const o = this.offer();
    if (!b || b.status !== BookingStatus.CONFIRMED) return false;
    return o?.type !== 'product';
  }

  isWaitingConfirmation(): boolean {
    return this.booking()?.status === BookingStatus.COMPLETION_REQUESTED;
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      accommodation: 'Alojamiento',
      event: 'Evento',
      service: 'Servicio',
      product: 'Producto',
    };
    return map[type?.toLowerCase()] ?? type;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'warning',
      CONFIRMED: 'primary',
      COMPLETION_REQUESTED: 'tertiary',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      EXPIRED: 'medium',
      FAILED: 'danger',
    };
    return map[status] ?? 'medium';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'Pendiente de pago',
      CONFIRMED: 'Confirmada',
      COMPLETION_REQUESTED: 'En completación',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
      FAILED: 'Fallida',
    };
    return map[status] ?? status;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
  }

  historyLabel(status: string): string {
    return this.statusLabel(status);
  }

  historyClass(status: string): string {
    return status?.toLowerCase().replace(/_/g, '-');
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

  get firstImage(): string {
    return this.offer()?.images?.[0] ?? '';
  }

  get formattedTotal(): string {
    const b = this.booking();
    return b ? Number(b.totalAmount).toLocaleString('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }) : '';
  }
}
