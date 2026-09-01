import { Component, inject, signal, effect, untracked } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  locateOutline,
  funnelOutline,
  leafOutline,
  umbrellaOutline,
  businessOutline,
  person,
  listOutline,
  mapOutline,
  alertCircleOutline,
  locationOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { DestinationService } from 'src/app/core/services/destination.service';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { Destination } from 'src/app/core/models/Destination';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';
import { DestinationCardComponent } from 'src/app/components/destination-card/destination-card.component';
import { MapDisplayComponent } from 'src/app/components/map-display/map-display.component';

@Component({
  selector: 'app-destinations',
  standalone: true,
  templateUrl: './destinations.page.html',
  styleUrls: ['./destinations.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CitySelectorBarComponent,
    DestinationCardComponent,
    MapDisplayComponent,
    ChatFabComponent,
  ],
})
export class DestinationsPage {
  private router = inject(Router);

  private destinationService = inject(DestinationService);
  private selectedCityService = inject(SelectedCityService);

  private readonly pageSize = 10;
  private page = 0;

  city = this.selectedCityService.city;
  loading = signal(false);
  loadingMore = signal(false);
  hasMore = signal(false);
  error = signal(false);
  errorMessage = '';

  viewMode = signal<'list' | 'map'>('list');

  destinations = signal<Destination[]>([]);
  selectedType = signal<string>('todos');
  centerOnDestination: Destination | null = null;

  readonly typeFilters = [
    { value: 'todos', label: 'Todos', icon: 'locate-outline' },
    { value: 'MUSEUM', label: 'Museos', icon: 'locate-outline' },
    { value: 'PARK', label: 'Parques', icon: 'leaf-outline' },
    { value: 'BEACH', label: 'Playas', icon: 'umbrella-outline' },
    { value: 'HISTORICAL_SITE', label: 'Históricos', icon: 'business-outline' },
    { value: 'NATURAL_RESERVE', label: 'Naturales', icon: 'leaf-outline' },
    { value: 'VIEWPOINT', label: 'Miradores', icon: 'locate-outline' },
    { value: 'SPOT', label: 'Lugares', icon: 'locate-outline' },
  ];

  constructor() {
    addIcons({
      person,
      listOutline,
      mapOutline,
      alertCircleOutline,
      locationOutline,
      locateOutline,
      funnelOutline,
      leafOutline,
      umbrellaOutline,
      businessOutline,
    });

    effect(() => {
      this.city();
      untracked(() => this.loadDestinations());
    });
  }

  loadDestinations(reset = true) {
    if (reset) {
      this.page = 0;
      this.destinations.set([]);
      this.loading.set(true);
      this.loadingMore.set(false);
    } else {
      this.page++;
      this.loadingMore.set(true);
    }

    this.error.set(false);

    const currentCity = this.city();
    const type = this.selectedType();

    const obs$ = !currentCity
      ? this.destinationService.getFeatured({ page: this.page, size: this.pageSize })
      : type === 'todos'
        ? this.destinationService.getByCity(currentCity.id, { page: this.page, size: this.pageSize })
        : this.destinationService.getByCityAndType(currentCity.id, type, { page: this.page, size: this.pageSize });

    obs$.subscribe({
      next: (res: any) => {
        const content: Destination[] = res.content || res || [];
        if (reset) {
          this.destinations.set(content);
        } else {
          this.destinations.update(curr => [...curr, ...content]);
        }
        this.hasMore.set(!res.last && content.length === this.pageSize);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar destinos';
      },
    });
  }

  loadMore(event: any) {
    this.loadDestinations(false);
    event.target.complete();
  }

  onTypeFilterChange(value: string) {
    this.selectedType.set(value);
    this.loadDestinations();
  }

  switchView(mode: 'list' | 'map') {
    this.viewMode.set(mode);
  }

  showOnMap(destination: Destination) {
    this.selectedType.set('todos');
    this.loadDestinations();
    this.centerOnDestination = destination;
    this.viewMode.set('map');
  }

  goToProfile() {
    localStorage.setItem('account_return_url', '/tabs/destinations');
    this.router.navigate(['/tabs/account']);
  }
}
