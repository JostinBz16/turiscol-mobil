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
    CitySelectorBarComponent,
    DestinationCardComponent,
    MapDisplayComponent,
  ],
})
export class DestinationsPage {
  private router = inject(Router);

  private destinationService = inject(DestinationService);
  private selectedCityService = inject(SelectedCityService);

  city = this.selectedCityService.city;
  loading = signal(false);
  error = signal(false);
  errorMessage = '';

  viewMode = signal<'list' | 'map'>('list');

  destinations = signal<Destination[]>([]);
  allDestinations: Destination[] = [];
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

  loadDestinations() {
    const currentCity = this.city();
    if (!currentCity) return;

    this.loading.set(true);
    this.error.set(false);

    this.destinationService.getByCity(currentCity.id).subscribe({
      next: (res: any) => {
        const list: Destination[] = res.content || res || [];
        this.allDestinations = list;
        this.filterDestinations();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar destinos';
      },
    });
  }

  filterDestinations() {
    const type = this.selectedType();
    const filtered =
      type === 'todos'
        ? this.allDestinations
        : this.allDestinations.filter((d) => d.type === type);
    this.destinations.set(filtered);
  }

  onTypeFilterChange(value: string) {
    this.selectedType.set(value);
    this.filterDestinations();
  }

  switchView(mode: 'list' | 'map') {
    this.viewMode.set(mode);
  }

  showOnMap(destination: Destination) {
    this.selectedType.set('todos');
    this.filterDestinations();
    this.centerOnDestination = destination;
    this.viewMode.set('map');
  }

  goToProfile() {
    localStorage.setItem('account_return_url', '/tabs/destinations');
    this.router.navigate(['/tabs/account']);
  }
}
