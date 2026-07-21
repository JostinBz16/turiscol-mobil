import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonChip, IonImg,
  IonSpinner, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline, storefrontOutline, receiptOutline, eyeOutline,
} from 'ionicons/icons';
import { BookingService } from 'src/app/core/services/booking';
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

@Component({
  selector: 'app-provider-sales',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonChip, IonImg,
    IonSpinner, IonRefresher, IonRefresherContent,
  ],
  templateUrl: './provider-sales.page.html',
  styleUrls: ['./provider-sales.page.scss'],
})
export class ProviderSalesPage implements OnInit {
  private bookingService = inject(BookingService);
  private router = inject(Router);

  sales: SaleItem[] = [];
  loading = true;

  constructor() {
    addIcons({
      chevronForwardOutline, storefrontOutline, receiptOutline, eyeOutline,
    });
  }

  async ngOnInit() {
    await this.loadSales();
  }

  async loadSales() {
    this.loading = true;
    try {
      const res = await firstValueFrom(this.bookingService.getProviderBookings());
      const content = res.content ?? res ?? [];
      this.sales = (Array.isArray(content) ? content : []).map((b: any) => ({
        id: b.id,
        offerName: b.offer?.name ?? b.offerName ?? 'Oferta',
        customerName: b.customerName ?? b.user?.userName ?? 'Cliente',
        status: b.status,
        totalAmount: b.totalAmount ?? 0,
        startDate: b.startDate ?? b.createdAt,
        offerImage: b.offer?.images?.[0]?.imageUrl ?? b.offerImage ?? '',
      }));
    } catch (err) {
      console.error('Error loading sales', err);
    }
    this.loading = false;
  }

  viewSale(id: string | number) {
    this.router.navigate(['/tabs/account/reservations/detail', id]);
  }

  async refresh(event: any) {
    await this.loadSales();
    event.target.complete();
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
