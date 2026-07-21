import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonIcon, IonButton, IonChip, IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, addOutline, receiptOutline, trendingUpOutline, eyeOutline, chevronForwardOutline, storefrontOutline, alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import { OfferService } from 'src/app/core/services/offers';
import { BookingService } from 'src/app/core/services/booking';
import { UserService } from 'src/app/core/services/User';
import { User } from 'src/app/core/models/User';
import { firstValueFrom } from 'rxjs';

interface DashboardStats {
  activeOffers: number;
  totalOffers: number;
  pendingBookings: number;
  totalRevenue: number;
}

interface RecentBooking {
  id: string | number;
  offerName: string;
  customerName: string;
  status: string;
  totalAmount: number;
  startDate: string;
  offerImage?: string;
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonIcon, IonButton, IonChip, IonImg,
  ],
  templateUrl: './provider-dashboard.component.html',
  styleUrls: ['./provider-dashboard.component.scss'],
})
export class ProviderDashboardComponent implements OnInit {
  private authStore = inject(AuthService);
  private offerService = inject(OfferService);
  private bookingService = inject(BookingService);
  private userService = inject(UserService);
  private router = inject(Router);

  user: User | null = null;
  stats: DashboardStats = { activeOffers: 0, totalOffers: 0, pendingBookings: 0, totalRevenue: 0 };
  recentBookings: RecentBooking[] = [];
  loading = true;

  constructor() {
    addIcons({
      gridOutline, addOutline, receiptOutline, trendingUpOutline, eyeOutline,
      chevronForwardOutline, storefrontOutline, alertCircleOutline,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    try {
      const profile = await firstValueFrom(this.userService.getProfile());
      this.user = profile;
    } catch { }

    try {
      const providerId = this.authStore.userId();
      if (providerId) {
        const offersRes = await firstValueFrom(
          this.offerService.findAll({ providerId, page: 0, size: 100 })
        );
        const offers = offersRes.content ?? [];
        this.stats.totalOffers = offersRes.totalElements ?? offers.length;
        this.stats.activeOffers = offers.filter((o: any) => o.active).length;
      }
    } catch { }

    try {
      const bookingsRes = await firstValueFrom(this.bookingService.getProviderBookings());
      const bookings = bookingsRes.content ?? bookingsRes;
      this.stats.pendingBookings = bookings.filter((b: any) => b.status === 'PENDING_PAYMENT' || b.status === 'CONFIRMED').length;
      this.stats.totalRevenue = bookings
        .filter((b: any) => b.status === 'COMPLETED' || b.status === 'CONFIRMED')
        .reduce((sum: number, b: any) => sum + (b.totalAmount ?? 0), 0);

      this.recentBookings = bookings.slice(0, 5).map((b: any) => ({
        id: b.id,
        offerName: b.offer?.name ?? b.offerName ?? 'Oferta',
        customerName: b.customerName ?? b.user?.userName ?? 'Cliente',
        status: b.status,
        totalAmount: b.totalAmount ?? 0,
        startDate: b.startDate ?? b.createdAt,
        offerImage: b.offer?.images?.[0]?.imageUrl ?? b.offerImage ?? '',
      }));
    } catch { }

    this.loading = false;
  }

  goToManageOffers() {
    this.router.navigate(['/tabs/manage-offers']);
  }

  goToCreateOffer() {
    this.router.navigate(['/tabs/manage-offers/new']);
  }

  goToSales() {
    this.router.navigate(['/tabs/provider-sales']);
  }

  viewBooking(booking: RecentBooking) {
    this.router.navigate(['/tabs/provider-sales', booking.id]);
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'warning',
      CONFIRMED: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      EXPIRED: 'medium',
      FAILED: 'danger',
    };
    return map[status] ?? 'medium';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING_PAYMENT: 'Pendiente',
      CONFIRMED: 'Confirmada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
      FAILED: 'Fallida',
    };
    return map[status] ?? status;
  }
}
