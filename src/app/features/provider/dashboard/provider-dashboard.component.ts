import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonIcon, IonButton, IonChip, IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, addOutline, receiptOutline, trendingUpOutline, eyeOutline, chevronForwardOutline, storefrontOutline, alertCircleOutline, checkmarkDoneOutline, closeCircleOutline, calendarOutline, walletOutline, bookOutline, cardOutline, starOutline, alertOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/features/auth/login/services/auth';
import { BookingService } from 'src/app/core/services/booking';
import { UserService } from 'src/app/core/services/User';
import { User } from 'src/app/core/models/User';
import { Booking } from 'src/app/core/models/Reservations';
import { ProviderFinanceService } from 'src/app/core/services/provider-finance.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

interface DashboardStats {
  activeOffers: number;
  inactiveOffers: number;
  totalOffers: number;
  offersByType: Record<string, number>;
  lowStockOffers: number;
  upcomingBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalBookings: number;
  totalRevenue: number;
  totalPaid: number;
  availableForPayout: number;
  nextPayoutDate: string | null;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  averageRating: number;
  ratingCount: number;
  onboardingCompleted: boolean;
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
  private bookingService = inject(BookingService);
  private userService = inject(UserService);
  private financeService = inject(ProviderFinanceService);
  private router = inject(Router);
  private navService = inject(NavigationService);

  user: User | null = null;
  stats: DashboardStats = {
    activeOffers: 0, inactiveOffers: 0, totalOffers: 0, offersByType: {},
    lowStockOffers: 0, upcomingBookings: 0, pendingBookings: 0,
    completedBookings: 0, cancelledBookings: 0, totalBookings: 0,
    totalRevenue: 0, totalPaid: 0, availableForPayout: 0, nextPayoutDate: null,
    currentMonthRevenue: 0, previousMonthRevenue: 0, averageRating: 0,
    ratingCount: 0, onboardingCompleted: false,
  };
  recentBookings: RecentBooking[] = [];
  loading = true;

  constructor() {
    addIcons({
      gridOutline, addOutline, receiptOutline, trendingUpOutline, eyeOutline,
      chevronForwardOutline, storefrontOutline, alertCircleOutline,
      checkmarkDoneOutline, closeCircleOutline, calendarOutline, walletOutline,
      bookOutline, cardOutline, starOutline, alertOutline,
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
      const dashboard = await firstValueFrom(this.financeService.getDashboard());
      this.stats = {
        activeOffers: Number(dashboard.activeOffers ?? 0),
        inactiveOffers: Number(dashboard.inactiveOffers ?? 0),
        totalOffers: Number(dashboard.totalOffers ?? 0),
        offersByType: dashboard.offersByType ?? {},
        lowStockOffers: Number(dashboard.lowStockOffers ?? 0),
        upcomingBookings: Number(dashboard.upcomingBookings ?? 0),
        pendingBookings: Number(dashboard.pendingBookings ?? 0),
        completedBookings: Number(dashboard.completedBookings ?? 0),
        cancelledBookings: Number(dashboard.cancelledBookings ?? 0),
        totalBookings: Number(dashboard.totalBookings ?? 0),
        totalRevenue: Number(dashboard.totalRevenue ?? 0),
        totalPaid: Number(dashboard.totalPaid ?? 0),
        availableForPayout: Number(dashboard.availableForPayout ?? 0),
        nextPayoutDate: dashboard.nextPayoutDate ?? null,
        currentMonthRevenue: Number(dashboard.currentMonthRevenue ?? 0),
        previousMonthRevenue: Number(dashboard.previousMonthRevenue ?? 0),
        averageRating: Number(dashboard.averageRating ?? 0),
        ratingCount: Number(dashboard.ratingCount ?? 0),
        onboardingCompleted: Boolean(dashboard.onboardingCompleted),
      };
    } catch { }

    try {
      const bookings = await firstValueFrom(this.bookingService.getProviderBookings());
      const sorted = [...bookings].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.recentBookings = sorted.slice(0, 5).map((b: any) => ({
        id: b.id,
        offerName: b.offerName ?? 'Oferta',
        customerName: 'Cliente',
        status: b.status,
        totalAmount: b.totalAmount ?? 0,
        startDate: b.startDate ?? b.createdAt,
        offerImage: b.offerImage ?? '',
      }));
    } catch { }

    this.loading = false;
  }

  goToManageOffers() {
    this.navService.setReturnUrl('/tabs/home');
    this.router.navigate(['/tabs/manage-offers']);
  }

  goToCreateOffer() {
    this.navService.setReturnUrl('/tabs/home');
    this.router.navigate(['/tabs/manage-offers/new']);
  }

  goToSales() {
    this.navService.setReturnUrl('/tabs/home');
    this.router.navigate(['/tabs/provider-sales']);
  }

  goToFinance() {
    this.navService.setReturnUrl('/tabs/home');
    this.router.navigate(['/tabs/provider-finance']);
  }

  goToPayments() {
    this.navService.setReturnUrl('/tabs/home');
    this.router.navigate(['/tabs/provider-payments']);
  }

  viewBooking(booking: RecentBooking) {
    this.navService.setReturnUrl('/tabs/home');
    this.router.navigate(['/tabs/provider-sales', booking.id]);
  }

  offersByTypeEntries(): { type: string; count: number }[] {
    return Object.entries(this.stats.offersByType).map(([type, count]) => ({
      type,
      count: Number(count),
    }));
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
      PENDING_PAYMENT: 'Pendiente',
      CONFIRMED: 'Confirmada',
      COMPLETION_REQUESTED: 'En completación',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      EXPIRED: 'Expirada',
      FAILED: 'Fallida',
    };
    return map[status] ?? status;
  }
}

