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
import {
  addOutline, createOutline, trashOutline, chevronForwardOutline, calendarOutline,
} from 'ionicons/icons';
import { FestivityService } from 'src/app/core/services/festivity.service';
import { Festivity } from 'src/app/core/models/Festivity';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-festivities',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel, IonBadge,
  ],
  templateUrl: './admin-festivities.page.html',
  styleUrls: ['./admin-festivities.page.scss'],
})
export class AdminFestivitiesPage implements OnInit {
  private festivityService = inject(FestivityService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  festivities = signal<Festivity[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, chevronForwardOutline, calendarOutline });
  }

  ngOnInit() {
    this.loadFestivities();
  }

  async loadFestivities() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.festivityService.getAll({ size: 100 }));
      this.festivities.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading festivities', err);
      this.festivities.set([]);
    }
    this.loading.set(false);
  }

  async confirmDelete(festivity: Festivity) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar festividad',
      message: `¿Estás seguro de eliminar "${festivity.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteFestivity(festivity),
        },
      ],
    });
    await alert.present();
  }

  private async deleteFestivity(festivity: Festivity) {
    try {
      await firstValueFrom(this.festivityService.delete(festivity.id));
      this.festivities.set(this.festivities().filter((f) => f.id !== festivity.id));
      this.showToast('Festividad eliminada');
    } catch (err) {
      console.error('Error deleting festivity', err);
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
    await this.loadFestivities();
    event.target.complete();
  }
}
