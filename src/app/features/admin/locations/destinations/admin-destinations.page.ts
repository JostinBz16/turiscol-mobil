import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
  IonRefresherContent, IonList, IonItem, IonLabel, IonBadge,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, chevronForwardOutline, locationOutline } from 'ionicons/icons';
import {
  LocationService,
  DestinationResponse,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-destinations',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel, IonBadge,
  ],
  templateUrl: './admin-destinations.page.html',
  styleUrls: ['./admin-destinations.page.scss'],
})
export class AdminDestinationsPage implements OnInit {
  private locationService = inject(LocationService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  destinations = signal<DestinationResponse[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, trashOutline, chevronForwardOutline, locationOutline });
  }

  ngOnInit() {
    this.loadDestinations();
  }

  async loadDestinations() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.locationService.getDestinations({ size: 100 }));
      this.destinations.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading destinations', err);
      this.destinations.set([]);
    }
    this.loading.set(false);
  }

  async confirmDelete(destination: DestinationResponse) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar destino',
      message: `¿Estás seguro de eliminar "${destination.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteDestination(destination),
        },
      ],
    });
    await alert.present();
  }

  private async deleteDestination(destination: DestinationResponse) {
    try {
      await firstValueFrom(this.locationService.deleteDestination(destination.id));
      this.destinations.set(this.destinations().filter((d) => d.id !== destination.id));
      this.showToast('Destino eliminado');
    } catch (err) {
      console.error('Error deleting destination', err);
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
    await this.loadDestinations();
    event.target.complete();
  }
}
