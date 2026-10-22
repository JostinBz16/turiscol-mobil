import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonButton, IonSpinner, IonList, IonItem, IonLabel, IonBadge,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline, callOutline, personCircleOutline, powerOutline, alertCircleOutline,
} from 'ionicons/icons';
import { UserService } from 'src/app/core/services/User';
import { UserApi } from 'src/app/core/models/User';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonButton, IonSpinner, IonList, IonItem, IonLabel, IonBadge,
  ],
  templateUrl: './admin-user-detail.page.html',
  styleUrls: ['./admin-user-detail.page.scss'],
})
export class AdminUserDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);

  userId: string | null = null;
  user = signal<UserApi | null>(null);
  loading = signal(true);
  error = signal(false);
  updating = signal(false);

  constructor() {
    addIcons({ mailOutline, callOutline, personCircleOutline, powerOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUser();
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  async loadUser() {
    if (!this.userId) return;
    this.loading.set(true);
    this.error.set(false);
    try {
      const user = await firstValueFrom(this.userService.getById(this.userId));
      this.user.set(user);
    } catch (err) {
      console.error('Error loading user', err);
      this.error.set(true);
    }
    this.loading.set(false);
  }

  async toggleActive() {
    const current = this.user();
    if (!current || this.updating()) return;
    this.updating.set(true);
    try {
      if (current.active) {
        await firstValueFrom(this.userService.deactivate(current.id));
        this.user.set({ ...current, active: false });
        this.showToast('Usuario desactivado');
      } else {
        await firstValueFrom(this.userService.activate(current.id));
        this.user.set({ ...current, active: true });
        this.showToast('Usuario activado');
      }
    } catch (err) {
      console.error('Error updating user status', err);
      this.showToast('No se pudo actualizar el usuario', 'danger');
    }
    this.updating.set(false);
  }

  goBack() {
    this.router.navigate(['/admin-dashboard/users']);
  }

  roleLabel(role: string | undefined): string {
    const map: Record<string, string> = {
      ADMIN: 'Admin',
      PROVIDER: 'Proveedor',
      CONSUMER: 'Turista',
    };
    return (role && map[role]) ?? role ?? '';
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
