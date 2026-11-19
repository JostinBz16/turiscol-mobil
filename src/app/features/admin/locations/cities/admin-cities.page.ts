import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
  IonRefresherContent, IonList, IonItem, IonLabel, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, chevronForwardOutline, mapOutline } from 'ionicons/icons';
import {
  LocationService,
  MunicipalityResponse,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-cities',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel, IonBadge,
  ],
  templateUrl: './admin-cities.page.html',
  styleUrls: ['./admin-cities.page.scss'],
})
export class AdminCitiesPage {
  private locationService = inject(LocationService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  cities = signal<MunicipalityResponse[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, trashOutline, chevronForwardOutline, mapOutline });
  }

  // True after the first entry; later entries reload silently (Ionic caches the view).
  private entered = false;

  ionViewWillEnter() {
    this.loadCities(this.entered);
    this.entered = true;
  }

  async loadCities(silent = false) {
    if (!silent) this.loading.set(true);
    try {
      const res = await firstValueFrom(this.locationService.getCities({ size: 100 }));
      this.cities.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading cities', err);
      if (!silent) this.cities.set([]);
    }
    this.loading.set(false);
  }

  async confirmDelete(city: MunicipalityResponse) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar ciudad',
      message: `¿Estás seguro de eliminar "${city.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteCity(city),
        },
      ],
    });
    await alert.present();
  }

  private async deleteCity(city: MunicipalityResponse) {
    try {
      await firstValueFrom(this.locationService.deleteCity(city.id));
      this.cities.set(this.cities().filter((c) => c.id !== city.id));
      this.showToast('Ciudad eliminada');
    } catch (err) {
      console.error('Error deleting city', err);
      this.showToast('Error al eliminar', 'danger');
    }
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

  async refresh(event: any) {
    await this.loadCities();
    event.target.complete();
  }
}
