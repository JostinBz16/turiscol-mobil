import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonSpinner, IonList, IonItem, IonLabel, IonBadge,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, callOutline, businessOutline, powerOutline, alertCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { ProviderAdminService, ProviderApi } from 'src/app/core/services/provider-admin.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-provider-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonSpinner, IonList, IonItem, IonLabel, IonBadge,
  ],
  templateUrl: './admin-provider-detail.page.html',
  styleUrls: ['./admin-provider-detail.page.scss'],
})
export class AdminProviderDetailPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private providerAdminService = inject(ProviderAdminService);
  private toastCtrl = inject(ToastController);

  providerId: string | null = null;
  provider = signal<ProviderApi | null>(null);
  loading = signal(true);
  error = signal(false);
  updating = signal(false);

  constructor() {
    addIcons({
      mailOutline, callOutline, businessOutline, powerOutline, alertCircleOutline,
      informationCircleOutline,
    });
  }

  // Runs on first entry and on every re-entry (Ionic caches the view for this URL).
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    // Silent reload only when the same record is already displayed.
    const silent = id === this.providerId && this.provider() !== null;
    this.providerId = id;
    if (this.providerId) {
      this.loadProvider(silent);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  async loadProvider(silent = false) {
    if (!this.providerId) return;
    if (!silent) {
      this.loading.set(true);
      this.error.set(false);
    }
    try {
      const provider = await firstValueFrom(
        this.providerAdminService.getById(this.providerId),
      );
      this.provider.set(provider);
      this.error.set(false);
    } catch (err) {
      console.error('Error loading provider', err);
      if (!silent) this.error.set(true);
    }
    this.loading.set(false);
  }

  /**
   * Toggles the provider's generic user account on/off. This is NOT a
   * differentiated provider-approval action — see TODO in
   * `ProviderAdminService` — it is surfaced in the UI as such.
   */
  async toggleActive() {
    const current = this.provider();
    if (!current || this.updating()) return;
    this.updating.set(true);
    try {
      if (current.active) {
        await firstValueFrom(this.providerAdminService.suspend(current.id));
        this.provider.set({ ...current, active: false });
        this.showToast('Proveedor suspendido');
      } else {
        await firstValueFrom(this.providerAdminService.approve(current.id));
        this.provider.set({ ...current, active: true });
        this.showToast('Proveedor activado');
      }
    } catch (err) {
      console.error('Error updating provider status', err);
      this.showToast('No se pudo actualizar el proveedor', 'danger');
    }
    this.updating.set(false);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard/providers']);
  }

  private async showToast(message: string, color = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
