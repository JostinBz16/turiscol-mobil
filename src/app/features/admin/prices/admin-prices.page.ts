import {
  Component, HostListener, OnInit, computed, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  IonContent, IonIcon, IonButton, IonSearchbar, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonToggle,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, closeOutline, refreshOutline, saveOutline,
} from 'ionicons/icons';
import { Observable, firstValueFrom } from 'rxjs';
import { PriceService, PriceListingRequest } from 'src/app/core/services/price';
import { Price } from 'src/app/core/models/Price';
import {
  LocationService,
  MunicipalityResponse,
} from 'src/app/core/services/location.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import {
  AdminDataTableComponent,
  AdminTableColumn,
} from '../shared/admin-data-table/admin-data-table.component';

/** Sentinel used by the filter selects for "no filter". */
const ALL = 'ALL';

/** Server page size and upper bound of pages requested when loading a full catalog. */
const FETCH_SIZE = 100;
const MAX_FETCH_PAGES = 20;

/** Rows shown per page in the table (pagination is done on the client). */
const PAGE_SIZE = 15;

/** The minimum price must not be greater than the maximum price. */
const priceRangeValidator: ValidatorFn = (group): ValidationErrors | null => {
  const min = group.get('minPrice')?.value;
  const max = group.get('maxPrice')?.value;
  if (min === null || min === undefined || min === '') return null;
  if (max === null || max === undefined || max === '') return null;
  return Number(min) > Number(max) ? { priceRange: true } : null;
};

@Component({
  selector: 'app-admin-prices',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    IonContent, IonIcon, IonButton, IonSearchbar, IonInput, IonTextarea,
    IonSelect, IonSelectOption, IonToggle,
    AdminPageHeaderComponent, AdminDataTableComponent,
  ],
  templateUrl: './admin-prices.page.html',
  styleUrls: ['./admin-prices.page.scss'],
})
export class AdminPricesPage implements OnInit {
  private priceService = inject(PriceService);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly all = ALL;

  readonly columns: AdminTableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'category', label: 'Categoría', width: '160px' },
    { key: 'city', label: 'Ciudad' },
    { key: 'range', label: 'Rango de precio', width: '220px' },
    { key: 'active', label: 'Estado', width: '120px' },
  ];

  readonly categories = [
    'HOSPEDAJE', 'PASADIA', 'GASTRONOMIA', 'TOUR', 'ARTESANIA',
    'TRANSPORTE', 'GUIA', 'SERVICIO_TECNICO', 'TEXTIL', 'BEBIDA', 'OTRO',
  ];

  prices = signal<Price[]>([]);
  cities = signal<MunicipalityResponse[]>([]);
  loading = signal(true);
  saving = signal(false);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form!: FormGroup;

  searchTerm = signal('');
  cityFilter = signal<string | number>(ALL);
  categoryFilter = signal<string>(ALL);
  page = signal(0);

  /** id -> name; keys are strings because `Price.municipalityId` is a string. */
  private cityNames = computed(
    () => new Map(this.cities().map((c) => [String(c.id), c.name])),
  );

  filteredPrices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const city = this.cityFilter();
    const category = this.categoryFilter();
    return this.prices().filter(
      (p) =>
        (city === ALL || String(p.municipalityId) === String(city)) &&
        (category === ALL || p.category === category) &&
        (!term || (p.name ?? '').toLowerCase().includes(term)),
    );
  });

  totalPages = computed(() => Math.ceil(this.filteredPrices().length / PAGE_SIZE));
  currentPage = computed(() => Math.min(this.page(), Math.max(this.totalPages() - 1, 0)));
  pagedPrices = computed(() => {
    const start = this.currentPage() * PAGE_SIZE;
    return this.filteredPrices().slice(start, start + PAGE_SIZE);
  });

  constructor() {
    addIcons({ addOutline, closeOutline, refreshOutline, saveOutline });
    this.initForm();
  }

  ngOnInit() {
    this.loadCities();
    this.loadPrices();
  }

  private initForm() {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        description: [''],
        category: ['', Validators.required],
        minPrice: [null, [Validators.required, Validators.min(1)]],
        maxPrice: [null, [Validators.required, Validators.min(1)]],
        cityId: [null, Validators.required],
        active: [true],
      },
      { validators: priceRangeValidator },
    );
  }

  /** Requests consecutive pages until the whole collection is covered (bounded). */
  private async fetchAllPages<T>(load: (page: number) => Observable<any>): Promise<T[]> {
    const items: T[] = [];
    for (let page = 0; page < MAX_FETCH_PAGES; page++) {
      const res = await firstValueFrom(load(page));
      // A plain array means the endpoint is not paginated: there is nothing else to fetch.
      if (Array.isArray(res)) return res;
      const content: T[] = res?.content ?? [];
      items.push(...content);
      if (!content.length || page + 1 >= (res?.totalPages ?? 1)) break;
    }
    return items;
  }

  async loadCities() {
    try {
      const cities = await this.fetchAllPages<MunicipalityResponse>((page) =>
        this.locationService.getCities({ page, size: FETCH_SIZE }),
      );
      this.cities.set(
        [...cities].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es')),
      );
    } catch (err) {
      console.error('Error loading cities', err);
      this.cities.set([]);
      this.showToast('No se pudieron cargar las ciudades', 'danger');
    }
  }

  async loadPrices() {
    this.loading.set(true);
    try {
      const prices = await this.fetchAllPages<Price>((page) =>
        this.priceService.getAll({ page, size: FETCH_SIZE }),
      );
      this.prices.set(prices);
    } catch (err) {
      console.error('Error loading prices', err);
      this.prices.set([]);
      this.showToast('No se pudieron cargar los precios', 'danger');
    }
    this.loading.set(false);
  }

  refresh() {
    this.loadCities();
    this.loadPrices();
  }

  cityName(price: Price): string {
    if (price.municipalityId === null || price.municipalityId === undefined) return '-';
    return this.cityNames().get(String(price.municipalityId)) ?? `Ciudad #${price.municipalityId}`;
  }

  onSearch(event: any) {
    this.searchTerm.set(event.detail?.value ?? '');
    this.page.set(0);
  }

  onCityFilterChange(event: any) {
    this.cityFilter.set(event.detail.value ?? ALL);
    this.page.set(0);
  }

  onCategoryFilterChange(event: any) {
    this.categoryFilter.set(event.detail.value ?? ALL);
    this.page.set(0);
  }

  onPageChange(page: number) {
    this.page.set(page);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ active: true });
    this.showForm.set(true);
  }

  openEdit(price: Price) {
    this.editingId.set(price.id);
    this.form.reset({ active: true });
    this.form.patchValue({
      name: price.name,
      description: price.description,
      category: price.category,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      // The API returns the id as a string; the select options and the request use numbers.
      cityId: price.municipalityId == null ? null : Number(price.municipalityId),
      active: price.active,
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form.reset({ active: true });
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) this.closeForm();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showForm() && !this.saving()) this.closeForm();
  }

  /** True when the group-level min/max check should be shown to the user. */
  showRangeError(): boolean {
    const min = this.form.get('minPrice');
    const max = this.form.get('maxPrice');
    return (
      !!this.form.errors?.['priceRange'] &&
      !!(min?.touched || min?.dirty || max?.touched || max?.dirty)
    );
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const dto: PriceListingRequest = {
      name: value.name,
      description: value.description ?? '',
      category: value.category,
      minPrice: Number(value.minPrice),
      maxPrice: Number(value.maxPrice),
      cityId: Number(value.cityId),
      active: !!value.active,
    };

    this.saving.set(true);
    try {
      if (this.editingId()) {
        await firstValueFrom(this.priceService.update(this.editingId()!, dto));
        this.showToast('Precio actualizado');
      } else {
        await firstValueFrom(this.priceService.create(dto));
        this.showToast('Precio creado');
      }
      this.closeForm();
      await this.loadPrices();
    } catch (err) {
      console.error('Error saving price', err);
      this.showToast('Error al guardar el precio', 'danger');
    } finally {
      this.saving.set(false);
    }
  }

  async confirmDelete(price: Price) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar precio',
      message: `¿Estás seguro de eliminar "${price.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deletePrice(price),
        },
      ],
    });
    await alert.present();
  }

  private async deletePrice(price: Price) {
    try {
      await firstValueFrom(this.priceService.delete(price.id));
      this.prices.set(this.prices().filter((p) => p.id !== price.id));
      this.showToast('Precio eliminado');
    } catch (err) {
      console.error('Error deleting price', err);
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

  categoryLabel(cat: string): string {
    const map: Record<string, string> = {
      HOSPEDAJE: 'Hospedaje', PASADIA: 'Pasadía', GASTRONOMIA: 'Gastronomía',
      TOUR: 'Tour', ARTESANIA: 'Artesanía', TRANSPORTE: 'Transporte',
      GUIA: 'Guía', SERVICIO_TECNICO: 'Servicio Técnico', TEXTIL: 'Textil',
      BEBIDA: 'Bebida', OTRO: 'Otro',
    };
    return map[cat] ?? cat;
  }
}
