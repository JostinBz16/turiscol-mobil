import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonIcon, IonButton, IonSpinner, IonSelect, IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline, personCircleOutline, powerOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { UserService } from 'src/app/core/services/User';
import { UserApi, RealmRole } from 'src/app/core/models/User';
import { firstValueFrom } from 'rxjs';
import {
  AdminBreadcrumb,
  AdminPageHeaderComponent,
} from '../../shared/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    IonContent, IonIcon, IonButton, IonSpinner, IonSelect, IonSelectOption,
    AdminPageHeaderComponent,
  ],
  templateUrl: './admin-user-detail.page.html',
  styleUrls: ['./admin-user-detail.page.scss'],
})
export class AdminUserDetailPage {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);

  userId: string | null = null;
  user = signal<UserApi | null>(null);
  loading = signal(true);
  error = signal(false);
  updating = signal(false);

  // Roles de realm aceptados por PUT /users/{id}/role (api-documentation.md:253).
  // GET /users/roles devuelve la lista cruda de roles de Keycloak ("interno"),
  // que puede incluir roles técnicos (offline_access, default-roles-*, etc.) no
  // asignables desde este panel; se usan los 3 roles de negocio documentados en
  // vez de poblar el select con esa lista sin filtrar.
  readonly roleOptions: RealmRole[] = ['USER', 'PROVIDER', 'ADMIN'];
  selectedRole = signal<RealmRole | null>(null);
  updatingRole = signal(false);

  breadcrumbs = computed<AdminBreadcrumb[]>(() => [
    { label: 'Usuarios', link: '/admin-dashboard/users' },
    { label: this.user()?.userName ?? 'Detalle' },
  ]);

  constructor() {
    addIcons({
      alertCircleOutline, personCircleOutline, powerOutline,
      shieldCheckmarkOutline,
    });
  }

  // Runs on first entry and on every re-entry (Ionic caches the view for this URL).
  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    // Silent reload only when the same record is already displayed.
    const silent = id === this.userId && this.user() !== null;
    this.userId = id;
    if (this.userId) {
      this.loadUser(silent);
    } else {
      this.error.set(true);
      this.loading.set(false);
    }
  }

  async loadUser(silent = false) {
    if (!this.userId) return;
    if (!silent) {
      this.loading.set(true);
      this.error.set(false);
    }
    try {
      const user = await firstValueFrom(this.userService.getById(this.userId));
      this.user.set(user);
      this.selectedRole.set(this.toRealmRole(user.role));
      this.error.set(false);
    } catch (err) {
      console.error('Error loading user', err);
      if (!silent) this.error.set(true);
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

  onRoleSelectChange(event: any) {
    const value = event.detail?.value;
    if (value) this.selectedRole.set(value);
  }

  async confirmRoleChange() {
    const current = this.user();
    const newRole = this.selectedRole();
    if (!current || !newRole || this.updatingRole()) return;
    this.updatingRole.set(true);
    try {
      await firstValueFrom(this.userService.updateRole(current.id, newRole));
      this.showToast('Rol actualizado');
      await this.loadUser();
    } catch (err) {
      console.error('Error updating user role', err);
      this.showToast('No se pudo actualizar el rol', 'danger');
    }
    this.updatingRole.set(false);
  }

  isRoleUnchanged(): boolean {
    const current = this.user();
    return !current || this.selectedRole() === this.toRealmRole(current.role);
  }

  roleLabel(role: string | undefined): string {
    const map: Record<string, string> = {
      ADMIN: 'Admin',
      PROVIDER: 'Proveedor',
      CONSUMER: 'Turista',
      USER: 'Turista',
    };
    return (role && map[role]) ?? role ?? '';
  }

  private toRealmRole(role: UserApi['role'] | undefined): RealmRole {
    if (role === 'CONSUMER') return 'USER';
    if (role === 'PROVIDER' || role === 'ADMIN') return role;
    return 'USER';
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
