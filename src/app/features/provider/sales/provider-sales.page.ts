import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonChip,
  IonImg,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline,
  storefrontOutline,
  receiptOutline,
  eyeOutline,
} from 'ionicons/icons';
import { BookingService } from 'src/app/core/services/booking';
import { Booking } from 'src/app/core/models/Reservations';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

interface SaleItem {
  id: string | number;
  offerName: string;
  customerName: string;
  status: string;
  totalAmount: number;
  startDate: string;
  offerImage?: string;
}

type SaleFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Component({
  selector: 'app-provider-sales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonChip,
    IonImg,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
  templateUrl: './provider-sales.page.html',
  styleUrls: ['./provider-sales.page.scss'],
})
export class ProviderSalesPage implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);
  navService = inject(NavigationService);

  sales: SaleItem[] = [];
  activeFilter: SaleFilter = 'all';
  loading = true;

  constructor() {
    addIcons({
      chevronForwardOutline,
      storefrontOutline,
      receiptOutline,
      eyeOutline,
    });
  }

  async ngOnInit() {
    await this.loadSales();
  }

  async loadSales() {
    this.loading = true;
    try {
      const content = await firstValueFrom(
        this.bookingService.getProviderBookings(),
      );
      this.sales = content.map((b: Booking) => ({
        id: b.id,
        offerName: b.offerName ?? 'Oferta',
        customerName: 'Cliente',
        status: b.status,
        totalAmount: b.totalAmount ?? 0,
        startDate: b.startDate ?? b.createdAt,
        offerImage: b.offerImage ?? '',
      }));
    } catch (err) {
      console.error('Error loading sales', err);
    }
    this.loading = false;
  }

  setFilter(filter: SaleFilter) {
    this.activeFilter = filter;
  }

  filteredSales(): SaleItem[] {
    switch (this.activeFilter) {
      case 'pending':
        return this.sales.filter((s) => s.status === 'PENDING_PAYMENT');
      case 'confirmed':
        return this.sales.filter((s) => s.status === 'CONFIRMED');
      case 'completed':
        return this.sales.filter((s) => s.status === 'COMPLETED');
      case 'cancelled':
        return this.sales.filter((s) => s.status === 'CANCELLED');
      default:
        return this.sales;
    }
  }

  filterCount(filter: SaleFilter): number {
    switch (filter) {
      case 'pending':
        return this.sales.filter((s) => s.status === 'PENDING_PAYMENT').length;
      case 'confirmed':
        return this.sales.filter((s) => s.status === 'CONFIRMED').length;
      case 'completed':
        return this.sales.filter((s) => s.status === 'COMPLETED').length;
      case 'cancelled':
        return this.sales.filter((s) => s.status === 'CANCELLED').length;
      default:
        return this.sales.length;
    }
  }

  viewSale(id: string | number) {
    this.navService.setReturnUrl('/tabs/provider-sales');
    this.router.navigate(['/tabs/provider-sales', id]);
  }

  async refresh(event: any) {
    await this.loadSales();
    event.target.complete();
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
