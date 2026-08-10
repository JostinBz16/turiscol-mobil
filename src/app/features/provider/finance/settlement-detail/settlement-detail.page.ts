import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonSpinner,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, calendarOutline, checkmarkDoneOutline,
  timeOutline, receiptOutline, alertCircleOutline,
} from 'ionicons/icons';
import { ProviderFinanceService } from 'src/app/core/services/provider-finance.service';
import { ProviderSettlementDto } from 'src/app/core/DTO/ProviderSettlementDto';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-provider-settlement-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonSpinner,
  ],
  templateUrl: './settlement-detail.page.html',
  styleUrls: ['./settlement-detail.page.scss'],
})
export class ProviderSettlementDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private financeService = inject(ProviderFinanceService);
  navService = inject(NavigationService);

  settlement = signal<ProviderSettlementDto | null>(null);
  loading = true;
  error = false;
  errorMessage = '';

  constructor() {
    addIcons({
      chevronBackOutline, calendarOutline, checkmarkDoneOutline,
      timeOutline, receiptOutline, alertCircleOutline,
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = true;
      this.errorMessage = 'Liquidación no encontrada';
      this.loading = false;
      return;
    }
    this.loadSettlement(id);
  }

  private async loadSettlement(id: string) {
    this.loading = true;
    this.error = false;
    try {
      const settlement = await firstValueFrom(this.financeService.getSettlementById(id));
      this.settlement.set(settlement);
    } catch {
      this.error = true;
      this.errorMessage = 'No se pudo cargar la liquidación';
    }
    this.loading = false;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}
