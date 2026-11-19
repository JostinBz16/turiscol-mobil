import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, refreshOutline } from 'ionicons/icons';
import { ProviderAdminService, ProviderApi } from 'src/app/core/services/provider-admin.service';
import { firstValueFrom } from 'rxjs';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import {
  AdminDataTableComponent,
  AdminTableColumn,
} from '../shared/admin-data-table/admin-data-table.component';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-admin-providers',
  standalone: true,
  imports: [
    RouterLink,
    IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
    AdminPageHeaderComponent, AdminDataTableComponent,
  ],
  templateUrl: './admin-providers.page.html',
  styleUrls: ['./admin-providers.page.scss'],
})
export class AdminProvidersPage {
  private providerAdminService = inject(ProviderAdminService);

  readonly pageSize = 15;

  readonly statusFilters: StatusFilter[] = ['ALL', 'ACTIVE', 'INACTIVE'];

  providers = signal<ProviderApi[]>([]);
  loading = signal(true);
  statusFilter = signal<StatusFilter>('ALL');
  searchTerm = signal('');

  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  // The role endpoint returns the base user fields; onboardingCompleted is only
  // shown when the backend actually sends it for the loaded rows.
  columns = computed<AdminTableColumn[]>(() => {
    const cols: AdminTableColumn[] = [
      { key: 'userName', label: 'Proveedor' },
      { key: 'email', label: 'Correo electrónico' },
      { key: 'phoneNumber', label: 'Teléfono', width: '160px' },
    ];
    if (this.providers().some((p) => p.onboardingCompleted !== undefined)) {
      cols.push({ key: 'onboardingCompleted', label: 'Onboarding', width: '140px' });
    }
    cols.push({ key: 'active', label: 'Estado', width: '120px' });
    return cols;
  });

  filteredProviders = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.providers().filter((p) => {
      if (status === 'ACTIVE' && !p.active) return false;
      if (status === 'INACTIVE' && p.active) return false;
      if (!term) return true;
      return (
        p.userName?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term) ||
        p.phoneNumber?.toLowerCase().includes(term)
      );
    });
  });

  // Guards against out-of-order responses when pages change quickly.
  private requestSeq = 0;

  constructor() {
    addIcons({ eyeOutline, refreshOutline });
  }

  // True after the first entry; later entries reload silently (Ionic caches the view).
  private entered = false;

  ionViewWillEnter() {
    this.loadProviders(this.entered);
    this.entered = true;
  }

  async loadProviders(silent = false) {
    const seq = ++this.requestSeq;
    if (!silent) this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.providerAdminService.listProviders({ page: this.page(), size: this.pageSize }),
      );
      if (seq !== this.requestSeq) return;
      const content: ProviderApi[] = Array.isArray(res) ? res : (res?.content ?? []);
      this.providers.set(content);
      this.totalPages.set(res?.totalPages ?? (content.length ? 1 : 0));
      this.totalElements.set(res?.totalElements ?? content.length);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      console.error('Error loading providers', err);
      if (!silent) {
        this.providers.set([]);
        this.totalPages.set(0);
        this.totalElements.set(0);
      }
    }
    this.loading.set(false);
  }

  onStatusFilterChange(event: any) {
    this.statusFilter.set(event.detail.value ?? 'ALL');
  }

  onSearch(event: any) {
    this.searchTerm.set(event.detail?.value ?? '');
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadProviders();
  }

  refresh() {
    this.loadProviders();
  }

  statusLabel(status: StatusFilter): string {
    const map: Record<StatusFilter, string> = {
      ALL: 'Todos',
      ACTIVE: 'Activos',
      INACTIVE: 'Inactivos',
    };
    return map[status];
  }
}
