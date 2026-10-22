import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonIcon, IonSpinner, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonLabel, IonBadge, IonSelect, IonSelectOption, IonToggle,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, personOutline, powerOutline } from 'ionicons/icons';
import { UserService } from 'src/app/core/services/User';
import { UserApi } from 'src/app/core/models/User';
import { firstValueFrom } from 'rxjs';

type RoleFilter = 'ALL' | UserApi['role'];

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonIcon, IonSpinner, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonLabel, IonBadge, IonSelect, IonSelectOption, IonToggle,
  ],
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage implements OnInit {
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);

  users = signal<UserApi[]>([]);
  loading = signal(true);
  roleFilter = signal<RoleFilter>('ALL');

  roles: RoleFilter[] = ['ALL', 'ADMIN', 'PROVIDER', 'CONSUMER'];

  constructor() {
    addIcons({ chevronForwardOutline, personOutline, powerOutline });
  }

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading.set(true);
    try {
      const filter = this.roleFilter();
      const res =
        filter === 'ALL'
          ? await firstValueFrom(this.userService.getAll({ size: 100 }))
          : await firstValueFrom(
              this.userService.getByRole(filter, { size: 100 }),
            );
      this.users.set(res?.content ?? res ?? []);
    } catch (err) {
      console.error('Error loading users', err);
      this.users.set([]);
    }
    this.loading.set(false);
  }

  onRoleFilterChange(event: any) {
    this.roleFilter.set(event.detail.value ?? 'ALL');
    this.loadUsers();
  }

  async toggleActive(user: UserApi, event: any) {
    const detail = event.detail;
    if (!detail) return;
    try {
      if (detail.checked) {
        await firstValueFrom(this.userService.activate(user.id));
      } else {
        await firstValueFrom(this.userService.deactivate(user.id));
      }
      this.users.set(
        this.users().map((u) =>
          u.id === user.id ? { ...u, active: detail.checked } : u,
        ),
      );
      this.showToast(detail.checked ? 'Usuario activado' : 'Usuario desactivado');
    } catch (err) {
      console.error('Error toggling user', err);
      detail.checked = !detail.checked;
      this.showToast('No se pudo actualizar el usuario', 'danger');
    }
  }

  async refresh(event: any) {
    await this.loadUsers();
    event.target.complete();
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      ALL: 'Todos',
      ADMIN: 'Admin',
      PROVIDER: 'Proveedor',
      CONSUMER: 'Turista',
    };
    return map[role] ?? role;
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
