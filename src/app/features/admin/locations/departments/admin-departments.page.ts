import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
  IonRefresherContent, IonList, IonItem, IonLabel,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, chevronForwardOutline, businessOutline } from 'ionicons/icons';
import {
  LocationService,
  DepartmentResponse,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonFab, IonFabButton, IonSpinner, IonRefresher,
    IonRefresherContent, IonList, IonItem, IonLabel,
  ],
  templateUrl: './admin-departments.page.html',
  styleUrls: ['./admin-departments.page.scss'],
})
export class AdminDepartmentsPage implements OnInit {
  private locationService = inject(LocationService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  departments = signal<DepartmentResponse[]>([]);
  loading = signal(true);

  constructor() {
    addIcons({ addOutline, trashOutline, chevronForwardOutline, businessOutline });
  }

  ngOnInit() {
    this.loadDepartments();
  }

  async loadDepartments() {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.locationService.getDepartments({ size: 100 }));
      this.departments.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading departments', err);
      this.departments.set([]);
    }
    this.loading.set(false);
  }

  async confirmDelete(department: DepartmentResponse) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar departamento',
      message: `¿Estás seguro de eliminar "${department.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteDepartment(department),
        },
      ],
    });
    await alert.present();
  }

  private async deleteDepartment(department: DepartmentResponse) {
    try {
      await firstValueFrom(this.locationService.deleteDepartment(department.id));
      this.departments.set(this.departments().filter((d) => d.id !== department.id));
      this.showToast('Departamento eliminado');
    } catch (err) {
      console.error('Error deleting department', err);
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
    await this.loadDepartments();
    event.target.complete();
  }
}
