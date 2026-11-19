import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
  IonToggle, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { UserService } from 'src/app/core/services/User';
import { UserApi, UserStats } from 'src/app/core/models/User';
import { firstValueFrom } from 'rxjs';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import {
  AdminDataTableComponent,
  AdminTableColumn,
} from '../shared/admin-data-table/admin-data-table.component';

type RoleFilter = 'ALL' | UserApi['role'];

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    RouterLink,
    IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
    IonToggle,
    AdminPageHeaderComponent, AdminDataTableComponent,
  ],
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage implements OnInit {
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);

  readonly pageSize = 15;

  readonly columns: AdminTableColumn[] = [
    { key: 'userName', label: 'Nombre' },
    { key: 'email', label: 'Correo electrónico' },
    { key: 'role', label: 'Rol', width: '140px' },
    { key: 'active', label: 'Estado', width: '120px' },
  ];

  readonly roles: RoleFilter[] = ['ALL', 'ADMIN', 'PROVIDER', 'CONSUMER'];

  users = signal<UserApi[]>([]);
  loading = signal(true);
  roleFilter = signal<RoleFilter>('ALL');
  searchTerm = signal('');

  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  stats = signal<UserStats | null>(null);

  filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.users();
    return this.users().filter(
      (u) =>
        u.userName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term),
    );
  });

  roleStats = computed(() =>
    Object.entries(this.stats()?.byRole ?? {}).map(([role, count]) => ({
      label: this.roleLabel(role),
      count,
    })),
  );

  // Guards against out-of-order responses when filters/pages change quickly.
  private requestSeq = 0;

  constructor() {
    addIcons({ refreshOutline });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  async loadUsers() {
    const seq = ++this.requestSeq;
    this.loading.set(true);
    try {
      const filter = this.roleFilter();
      const params = { page: this.page(), size: this.pageSize };
      const res =
        filter === 'ALL'
          ? await firstValueFrom(this.userService.getAll(params))
          : await firstValueFrom(this.userService.getByRole(filter, params));
      if (seq !== this.requestSeq) return;
      const content: UserApi[] = Array.isArray(res) ? res : (res?.content ?? []);
      this.users.set(content);
      this.totalPages.set(res?.totalPages ?? (content.length ? 1 : 0));
      this.totalElements.set(res?.totalElements ?? content.length);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      console.error('Error loading users', err);
      this.users.set([]);
      this.totalPages.set(0);
      this.totalElements.set(0);
    }
    this.loading.set(false);
  }

  async loadStats() {
    try {
      this.stats.set(await firstValueFrom(this.userService.getStats()));
    } catch (err) {
      // The summary is optional: hide the cards and keep the list working.
      console.error('Error loading user stats', err);
      this.stats.set(null);
    }
  }

  onRoleFilterChange(event: any) {
    this.roleFilter.set(event.detail.value ?? 'ALL');
    this.page.set(0);
    this.loadUsers();
  }

  onSearch(event: any) {
    this.searchTerm.set(event.detail?.value ?? '');
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadUsers();
  }

  refresh() {
    this.loadUsers();
    this.loadStats();
  }

  async toggleActive(user: UserApi, event: any) {
    const detail = event.detail;
    const toggle = event.target as HTMLIonToggleElement | null;
    if (!detail) return;
    const checked: boolean = detail.checked;
    try {
      if (checked) {
        await firstValueFrom(this.userService.activate(user.id));
      } else {
        await firstValueFrom(this.userService.deactivate(user.id));
      }
      this.users.set(
        this.users().map((u) =>
          u.id === user.id ? { ...u, active: checked } : u,
        ),
      );
      this.showToast(checked ? 'Usuario activado' : 'Usuario desactivado');
      this.loadStats();
    } catch (err) {
      console.error('Error toggling user', err);
      if (toggle) toggle.checked = !checked;
      this.showToast('No se pudo actualizar el usuario', 'danger');
    }
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      ALL: 'Todos',
      ADMIN: 'Admin',
      PROVIDER: 'Proveedor',
      CONSUMER: 'Turista',
      USER: 'Turista',
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
