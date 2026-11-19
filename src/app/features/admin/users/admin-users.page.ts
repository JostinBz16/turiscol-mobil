import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, refreshOutline } from 'ionicons/icons';
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
    AdminPageHeaderComponent, AdminDataTableComponent,
  ],
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage {
  private userService = inject(UserService);

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
    addIcons({ eyeOutline, refreshOutline });
  }

  // True after the first entry; later entries reload silently (Ionic caches the view).
  private entered = false;

  ionViewWillEnter() {
    this.loadUsers(this.entered);
    this.loadStats();
    this.entered = true;
  }

  async loadUsers(silent = false) {
    const seq = ++this.requestSeq;
    if (!silent) this.loading.set(true);
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
      if (!silent) {
        this.users.set([]);
        this.totalPages.set(0);
        this.totalElements.set(0);
      }
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
}
