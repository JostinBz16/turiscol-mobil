import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline, lockClosed, lockOpen, refreshOutline, star, starOutline,
} from 'ionicons/icons';
import { Observable, firstValueFrom } from 'rxjs';
import { OfferService } from 'src/app/core/services/offers';
import { UserService } from 'src/app/core/services/User';
import {
  LocationService,
  MunicipalityResponse,
} from 'src/app/core/services/location.service';
import { Offer } from 'src/app/core/models/Offers';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import {
  AdminDataTableComponent,
  AdminTableColumn,
} from '../shared/admin-data-table/admin-data-table.component';
import {
  MODERATION_COPY,
  ModerationAction,
  confirmModeration,
  formatOfferPrice,
  offerActionErrorMessage,
  offerStatusLabel,
  offerTypeLabel,
  shortId,
} from './admin-offer.utils';

/** Sentinel used by the selects for "no filter". */
const ALL = 'ALL';

/** Page size and upper bound of pages requested when loading the city catalog. */
const FETCH_SIZE = 100;
const MAX_FETCH_PAGES = 20;

/** Row shape of GET /offers/search (OfferResponseDTO): price comes as `baseprice`. */
type OfferRow = Omit<Offer, 'basePrice' | 'images'> & { baseprice: number };

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [
    RouterLink,
    IonContent, IonButton, IonIcon, IonSelect, IonSelectOption, IonSearchbar,
    AdminPageHeaderComponent, AdminDataTableComponent,
  ],
  templateUrl: './admin-offers.page.html',
  styleUrls: ['./admin-offers.page.scss'],
})
export class AdminOffersPage implements OnInit {
  private offerService = inject(OfferService);
  private userService = inject(UserService);
  private locationService = inject(LocationService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  readonly pageSize = 15;
  readonly all = ALL;

  readonly columns: AdminTableColumn[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'type', label: 'Tipo', width: '130px' },
    { key: 'city', label: 'Ciudad' },
    { key: 'provider', label: 'Proveedor' },
    { key: 'price', label: 'Precio', width: '130px', align: 'right' },
    { key: 'featured', label: 'Destacada', width: '120px' },
    { key: 'status', label: 'Estado', width: '120px' },
  ];

  readonly typeOptions = ['product', 'service', 'event', 'accommodation'];

  offers = signal<OfferRow[]>([]);
  cities = signal<MunicipalityResponse[]>([]);
  loading = signal(true);

  searchTerm = signal('');
  typeFilter = signal<string>(ALL);
  cityFilter = signal<string | number>(ALL);
  activeFilter = signal<string>(ALL);
  featuredFilter = signal<string>(ALL);

  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  /** Offer ids with a moderation request in flight (disables their buttons). */
  busyIds = signal<ReadonlySet<string>>(new Set());

  private cityNames = computed(
    () => new Map(this.cities().map((c) => [String(c.id), c.name])),
  );
  private providerNames = signal<Readonly<Record<string, string>>>({});
  private providersInFlight = new Set<string>();

  // Guards against out-of-order responses when filters/pages change quickly.
  private requestSeq = 0;

  constructor() {
    addIcons({ eyeOutline, lockClosed, lockOpen, refreshOutline, star, starOutline });
  }

  ngOnInit() {
    this.loadCities();
    this.loadOffers();
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

  /** Loads the full city catalog (names for the column and options for the filter). */
  async loadCities() {
    try {
      const cities = await this.fetchAllPages<MunicipalityResponse>((page) =>
        this.locationService.getCities({ page, size: FETCH_SIZE }),
      );
      this.cities.set(
        [...cities].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'es')),
      );
    } catch (err) {
      // City names/filter are optional: keep the list working without them.
      console.error('Error loading cities', err);
      this.cities.set([]);
    }
  }

  async loadOffers() {
    const seq = ++this.requestSeq;
    this.loading.set(true);
    try {
      const city = this.cityFilter();
      const res = await firstValueFrom(
        this.offerService.search({
          name: this.searchTerm().trim() || undefined,
          type: this.typeFilter() === ALL ? undefined : this.typeFilter(),
          cityId: city === ALL ? undefined : String(city),
          active: this.toBoolean(this.activeFilter()),
          featured: this.toBoolean(this.featuredFilter()),
          page: this.page(),
          size: this.pageSize,
        }),
      );
      if (seq !== this.requestSeq) return;
      const content: OfferRow[] = res?.content ?? [];
      this.offers.set(content);
      this.totalPages.set(res?.totalPages ?? 0);
      this.totalElements.set(res?.totalElements ?? content.length);
      this.loading.set(false);
      this.resolveProviders(content);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      console.error('Error loading offers', err);
      this.offers.set([]);
      this.totalPages.set(0);
      this.totalElements.set(0);
      this.loading.set(false);
      this.showToast('No se pudieron cargar las ofertas', 'danger');
    }
  }

  /** Resolves, once per id, the provider names for the unique ids of the page. */
  private async resolveProviders(rows: OfferRow[]) {
    const known = this.providerNames();
    const missing = [...new Set(rows.map((r) => r.providerId))].filter(
      (id) => id && !(id in known) && !this.providersInFlight.has(id),
    );
    if (!missing.length) return;
    missing.forEach((id) => this.providersInFlight.add(id));

    const resolved: Record<string, string> = {};
    await Promise.all(
      missing.map(async (id) => {
        try {
          const user = await firstValueFrom(this.userService.getById(id));
          if (user?.userName) resolved[id] = user.userName;
        } catch (err) {
          // Unresolved ids fall back to the abbreviated id and are retried later.
          console.error('Error loading provider', err);
        } finally {
          this.providersInFlight.delete(id);
        }
      }),
    );
    if (Object.keys(resolved).length) {
      this.providerNames.update((names) => ({ ...names, ...resolved }));
    }
  }

  cityName(offer: OfferRow): string {
    if (offer.cityId === null || offer.cityId === undefined) return '-';
    // A city missing from the catalog still shows its id instead of an empty cell.
    return this.cityNames().get(String(offer.cityId)) ?? `Ciudad #${offer.cityId}`;
  }

  providerName(offer: OfferRow): string {
    return this.providerNames()[offer.providerId] ?? shortId(offer.providerId);
  }

  typeLabel = offerTypeLabel;
  statusLabel = offerStatusLabel;
  price = (offer: OfferRow) => formatOfferPrice(offer.baseprice);

  onSearch(event: any) {
    const value: string = event.detail?.value ?? '';
    if (value === this.searchTerm()) return;
    this.searchTerm.set(value);
    this.resetAndLoad();
  }

  onTypeChange(event: any) {
    this.typeFilter.set(event.detail.value ?? ALL);
    this.resetAndLoad();
  }

  onCityChange(event: any) {
    this.cityFilter.set(event.detail.value ?? ALL);
    this.resetAndLoad();
  }

  onActiveChange(event: any) {
    this.activeFilter.set(event.detail.value ?? ALL);
    this.resetAndLoad();
  }

  onFeaturedChange(event: any) {
    this.featuredFilter.set(event.detail.value ?? ALL);
    this.resetAndLoad();
  }

  onPageChange(page: number) {
    this.page.set(page);
    this.loadOffers();
  }

  refresh() {
    this.loadOffers();
  }

  toggleBlock(offer: OfferRow) {
    return this.moderate(offer, offer.blocked ? 'unblock' : 'block');
  }

  toggleFeatured(offer: OfferRow) {
    return this.moderate(offer, offer.featured ? 'unfeature' : 'feature');
  }

  private async moderate(offer: OfferRow, action: ModerationAction) {
    if (this.busyIds().has(offer.id)) return;
    if (!(await confirmModeration(this.alertCtrl, action, offer.name))) return;

    this.setBusy(offer.id, true);
    try {
      switch (action) {
        case 'block':
          await firstValueFrom(this.offerService.block(offer.id));
          this.patchRow(offer.id, { blocked: true, active: false });
          break;
        case 'unblock':
          // Unblocking does not reactivate the offer: keep `active` as is.
          await firstValueFrom(this.offerService.unblock(offer.id));
          this.patchRow(offer.id, { blocked: false });
          break;
        case 'feature':
        case 'unfeature':
          await firstValueFrom(this.offerService.setFeatured(offer.id, action === 'feature'));
          this.patchRow(offer.id, { featured: action === 'feature' });
          break;
      }
      this.showToast(MODERATION_COPY[action].success);
    } catch (err: any) {
      console.error('Error moderating offer', err);
      this.showToast(offerActionErrorMessage(err), 'danger');
      // The offer no longer exists: reload so the list stays truthful.
      if (err?.status === 404) this.loadOffers();
    } finally {
      this.setBusy(offer.id, false);
    }
  }

  private patchRow(id: string, changes: Partial<OfferRow>) {
    this.offers.update((rows) => rows.map((o) => (o.id === id ? { ...o, ...changes } : o)));
  }

  private setBusy(id: string, busy: boolean) {
    this.busyIds.update((ids) => {
      const next = new Set(ids);
      if (busy) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  private resetAndLoad() {
    this.page.set(0);
    this.loadOffers();
  }

  private toBoolean(value: string): boolean | undefined {
    return value === ALL ? undefined : value === 'true';
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
