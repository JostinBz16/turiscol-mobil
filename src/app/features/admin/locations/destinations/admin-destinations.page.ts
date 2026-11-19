import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, refreshOutline } from 'ionicons/icons';
import {
  LocationService,
  DestinationResponse,
  MunicipalityResponse,
} from 'src/app/core/services/location.service';
import { firstValueFrom } from 'rxjs';
import { AdminPageHeaderComponent } from '../../shared/admin-page-header/admin-page-header.component';
import {
  AdminDataTableComponent,
  AdminTableColumn,
} from '../../shared/admin-data-table/admin-data-table.component';

/** Sentinel used by the city select for "no city filter". */
const ALL_CITIES = 'ALL';

@Component({
  selector: 'app-admin-destinations',
  standalone: true,
  imports: [
    RouterLink,
    IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
    AdminPageHeaderComponent, AdminDataTableComponent,
  ],
  templateUrl: './admin-destinations.page.html',
  styleUrls: ['./admin-destinations.page.scss'],
})
export class AdminDestinationsPage implements OnInit {
  private locationService = inject(LocationService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly pageSize = 15;
  readonly allCities = ALL_CITIES;

  readonly columns: AdminTableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'municipality', label: 'Municipio' },
    { key: 'featured', label: 'Destacado', width: '130px' },
    { key: 'active', label: 'Estado', width: '120px' },
  ];

  destinations = signal<DestinationResponse[]>([]);
  cities = signal<MunicipalityResponse[]>([]);
  loading = signal(true);
  cityFilter = signal<string | number>(ALL_CITIES);
  searchTerm = signal('');

  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  filteredDestinations = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.destinations();
    return this.destinations().filter(
      (d) =>
        d.name?.toLowerCase().includes(term) ||
        d.municipality?.name?.toLowerCase().includes(term),
    );
  });

  // Guards against out-of-order responses when filters/pages change quickly.
  private requestSeq = 0;

  constructor() {
    addIcons({ addOutline, refreshOutline });
  }

  ngOnInit() {
    this.loadCities();
    this.loadDestinations();
  }

  async loadCities() {
    try {
      const res = await firstValueFrom(this.locationService.getCities({ size: 100 }));
      this.cities.set(res?.content ?? res ?? []);
    } catch (err) {
      // The city filter is optional: keep the list working without it.
      console.error('Error loading cities', err);
      this.cities.set([]);
    }
  }

  async loadDestinations() {
    const seq = ++this.requestSeq;
    this.loading.set(true);
    try {
      const city = this.cityFilter();
      const params = { page: this.page(), size: this.pageSize };
      const res =
        city === ALL_CITIES
          ? await firstValueFrom(this.locationService.getDestinations(params))
          : await firstValueFrom(this.locationService.getDestinationsByCity(city, params));
      if (seq !== this.requestSeq) return;
      const content: DestinationResponse[] = Array.isArray(res) ? res : (res?.content ?? []);
      this.destinations.set(content);
      this.totalPages.set(res?.totalPages ?? (content.length ? 1 : 0));
      this.totalElements.set(res?.totalElements ?? content.length);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      console.error('Error loading destinations', err);
      this.destinations.set([]);
      this.totalPages.set(0);
      this.totalElements.set(0);
    }
    this.loading.set(false);
  }

  onCityFilterChange(event: any) {
    this.cityFilter.set(event.detail.value ?? ALL_CITIES);
    this.page.set(0);
    this.loadDestinations();
  }

  onSearch(event: any) {
    this.searchTerm.set(event.detail?.value ?? '');
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadDestinations();
  }

  refresh() {
    this.loadDestinations();
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
      this.showToast('Destino eliminado');
      // Reload so pagination totals stay correct; step back if the page became empty.
      if (this.destinations().length === 1 && this.page() > 0) {
        this.page.set(this.page() - 1);
      }
      this.loadDestinations();
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
}
