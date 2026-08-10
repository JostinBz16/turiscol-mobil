import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonChip, IonSegment, IonSegmentButton, IonLabel,
  IonSpinner, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline, walletOutline, trendingUpOutline, checkmarkDoneOutline,
  timeOutline, cashOutline,
} from 'ionicons/icons';
import { ProviderFinanceService } from 'src/app/core/services/provider-finance.service';
import { ProviderEarningDto } from 'src/app/core/DTO/ProviderEarningDto';
import { ProviderSettlementDto } from 'src/app/core/DTO/ProviderSettlementDto';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-provider-finance',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonChip, IonSegment, IonSegmentButton, IonLabel,
    IonSpinner, IonRefresher, IonRefresherContent,
  ],
  templateUrl: './provider-finance.page.html',
  styleUrls: ['./provider-finance.page.scss'],
})
export class ProviderFinancePage implements OnInit {
  private financeService = inject(ProviderFinanceService);
  private router = inject(Router);
  navService = inject(NavigationService);

  segment: 'settlements' | 'earnings' = 'settlements';
  settlements: ProviderSettlementDto[] = [];
  earnings: ProviderEarningDto[] = [];
  loading = true;

  constructor() {
    addIcons({
      chevronForwardOutline, walletOutline, trendingUpOutline,
      checkmarkDoneOutline, timeOutline, cashOutline,
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [settlements, earnings] = await Promise.all([
        firstValueFrom(this.financeService.getSettlements()).catch(() => []),
        firstValueFrom(this.financeService.getEarnings()).catch(() => []),
      ]);
      this.settlements = settlements;
      this.earnings = earnings;
    } catch (err) {
      console.error('Error loading finance data', err);
    }
    this.loading = false;
  }

  setSegment(value: any) {
    this.segment = value?.detail?.value ?? value;
  }

  viewSettlement(id: number | string) {
    this.navService.setReturnUrl('/tabs/provider-finance');
    this.router.navigate(['/tabs/provider-finance', id]);
  }

  async refresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  payoutLabel(status: string): string {
    return {
      PENDING: 'Pendiente',
      AVAILABLE: 'Disponible',
      SETTLED: 'Liquidado',
    }[status] ?? status;
  }

  payoutColor(status: string): string {
    return {
      PENDING: 'warning',
      AVAILABLE: 'primary',
      SETTLED: 'success',
    }[status] ?? 'medium';
  }
}
