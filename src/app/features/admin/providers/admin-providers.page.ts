import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonSpinner, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge, IonToggle,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, businessOutline, powerOutline } from 'ionicons/icons';
import { ProviderAdminService, ProviderApi } from 'src/app/core/services/provider-admin.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonSpinner, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge, IonToggle,
  ],
  templateUrl: './admin-providers.page.html',
  styleUrls: ['./admin-providers.page.scss'],
})
export class AdminProvidersPage {
  private providerAdminService = inject(ProviderAdminService);
  private toastCtrl = inject(ToastController);

  providers = signal<ProviderApi[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ chevronForwardOutline, businessOutline, powerOutline });
  }

  // True after the first entry; later entries reload silently (Ionic caches the view).
  private entered = false;

  ionViewWillEnter() {
    this.loadProviders(this.entered);
    this.entered = true;
  }

  async loadProviders(silent = false) {
    if (!silent) this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.providerAdminService.listProviders({ size: 100 }),
      );
      this.providers.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading providers', err);
      if (!silent) this.providers.set([]);
    }
    this.loading.set(false);
  }

  async toggleActive(provider: ProviderApi, event: any) {
    const detail = event.detail;
    if (!detail) return;
    try {
      if (detail.checked) {
        await firstValueFrom(this.providerAdminService.approve(provider.id));
      } else {
        await firstValueFrom(this.providerAdminService.suspend(provider.id));
      }
      this.providers.set(
        this.providers().map((p) =>
          p.id === provider.id ? { ...p, active: detail.checked } : p,
        ),
      );
      this.showToast(detail.checked ? 'Proveedor activado' : 'Proveedor suspendido');
    } catch (err) {
      console.error('Error toggling provider', err);
      detail.checked = !detail.checked;
      this.showToast('No se pudo actualizar el proveedor', 'danger');
    }
  }

  async refresh(event: any) {
    await this.loadProviders();
    event.target.complete();
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
