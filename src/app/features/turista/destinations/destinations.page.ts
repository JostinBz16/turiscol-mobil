import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  untracked,
} from '@angular/core';
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
  IonImg,
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
import * as L from 'leaflet';

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
    IonImg,
    CitySelectorBarComponent,
  ],
})
export class DestinationsPage implements OnInit, OnDestroy {
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

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

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

  readonly typeLabels: Record<string, string> = {
    MUSEUM: 'Museo',
    PARK: 'Parque',
    BEACH: 'Playa',
    HISTORICAL_SITE: 'Histórico',
    NATURAL_RESERVE: 'Reserva Natural',
    VIEWPOINT: 'Mirador',
    SPOT: 'Lugar',
  };

  readonly typeColors: Record<string, string> = {
    MUSEUM: '#e74c3c',
    PARK: '#27ae60',
    BEACH: '#3498db',
    HISTORICAL_SITE: '#f39c12',
    NATURAL_RESERVE: '#2ecc71',
    VIEWPOINT: '#9b59b6',
    SPOT: '#e67e22',
  };

  constructor(private router: Router) {
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

  ngOnInit() {}

  ngOnDestroy() {
    this.map?.remove();
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
        if (this.viewMode() === 'map') {
          setTimeout(() => this.initMap(), 100);
        }
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
    this.updateMarkers();
  }

  onTypeFilterChange(value: string) {
    this.selectedType.set(value);
    this.filterDestinations();
  }

  switchView(mode: 'list' | 'map') {
    this.viewMode.set(mode);
    if (mode === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
  }

  showOnMap(destination: Destination) {
    this.selectedType.set('todos');
    this.filterDestinations();
    this.viewMode.set('map');
    setTimeout(() => {
      this.initMap();
      if (this.map && destination.latitude && destination.longitude) {
        this.map.setView([destination.latitude, destination.longitude], 15);
      }
    }, 100);
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || type;
  }

  getTypeColor(type: string): string {
    return this.typeColors[type] || '#666';
  }

  private initMap() {
    if (this.map) {
      this.map.invalidateSize();
      this.updateMarkers();
      return;
    }

    const currentCity = this.city();
    if (!currentCity) return;

    this.map = L.map('map-canvas', {
      center: [4.5709, -74.2973],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.map.addControl(L.control.zoom({ position: 'bottomright' }));

    setTimeout(() => this.map?.invalidateSize(), 200);
    this.updateMarkers();
  }

  private updateMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const dests = this.destinations();
    if (!this.map) return;

    const latlngs: L.LatLng[] = [];

    dests.forEach((d) => {
      if (!d.latitude || !d.longitude) return;

      const icon = this.getMarkerIcon(d.type);
      const latlng = L.latLng(d.latitude, d.longitude);
      const marker = L.marker(latlng, { icon }).addTo(this.map!);

      marker.bindPopup(`
        <b>${d.name}</b><br/>
        ${d.description || ''}<br/>
        <small>${this.getTypeLabel(d.type)}</small>
      `);

      this.markers.push(marker);
      latlngs.push(latlng);
    });

    if (latlngs.length > 0) {
      this.map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
    }
  }

  private getMarkerIcon(type: string): L.DivIcon {
    const color = this.getTypeColor(type);

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: ${color};
        width: 24px; height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
  }

  goToProfile() {
    localStorage.setItem('account_return_url', '/tabs/destinations');
    this.router.navigate(['/tabs/account']);
  }
}
