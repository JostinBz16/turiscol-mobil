import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
  IonRouterLink,
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
} from 'ionicons/icons';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';
import * as L from 'leaflet';

interface Destination {
  id: string;
  name: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  image?: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
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
    IonRouterLink,
    CitySelectorBarComponent,
  ],
})
export class MapPage implements OnInit, OnDestroy {
  private municipalityService = inject(MunicipalityService);
  private selectedCityService = inject(SelectedCityService);

  city = this.selectedCityService.city;
  loading = signal(false);
  destinations = signal<Destination[]>([]);
  allDestinations: Destination[] = [];
  selectedType = signal<string>('todos');

  private map: L.Map | undefined;
  private markers: L.Marker[] = [];

  readonly typeFilters = [
    { value: 'todos', label: 'Todos', icon: 'locate-outline' },
    { value: 'MUSEUM', label: 'Museos', icon: 'museum-outline' },
    { value: 'PARK', label: 'Parques', icon: 'leaf-outline' },
    { value: 'BEACH', label: 'Playas', icon: 'umbrella-outline' },
    { value: 'HISTORICAL_SITE', label: 'Históricos', icon: 'business-outline' },
    { value: 'NATURAL_RESERVE', label: 'Naturales', icon: 'leaf-outline' },
    { value: 'VIEWPOINT', label: 'Miradores', icon: 'locate-outline' },
    { value: 'SPOT', label: 'Lugares', icon: 'locate-outline' },
  ];

  constructor() {
    addIcons({
      locateOutline,
      funnelOutline,
      leafOutline,
      umbrellaOutline,
      businessOutline,
  person,
    });
  }

  ngOnInit() {
    this.loadDestinations();
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  loadDestinations() {
    const currentCity = this.city();
    if (!currentCity) return;

    this.loading.set(true);
    this.municipalityService.getDestinationsByCity(currentCity.id).subscribe({
      next: (res: any) => {
        const list: Destination[] = res.content || res || [];
        this.allDestinations = list;
        this.filterDestinations();
        this.loading.set(false);
        this.initMap();
      },
      error: () => {
        this.loading.set(false);
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

  onTypeFilterChange(event: any) {
    const value = typeof event === 'string' ? event : event?.detail?.value;
    this.selectedType.set(value);
    this.filterDestinations();
  }

  private initMap() {
    if (this.map) this.map.remove();

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
        <small>${d.type}</small>
      `);

      this.markers.push(marker);
      latlngs.push(latlng);
    });

    if (latlngs.length > 0) {
      this.map.fitBounds(L.latLngBounds(latlngs), { padding: [50, 50] });
    }
  }

  private getMarkerIcon(type: string): L.DivIcon {
    const colorMap: Record<string, string> = {
      MUSEUM: '#e74c3c',
      PARK: '#27ae60',
      BEACH: '#3498db',
      HISTORICAL_SITE: '#f39c12',
      NATURAL_RESERVE: '#2ecc71',
      VIEWPOINT: '#9b59b6',
      SPOT: '#e67e22',
    };

    const color = colorMap[type] || '#666';

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

  centerOnCity() {
    const currentCity = this.city();
    if (!currentCity || !this.map) return;
    if (this.destinations().length > 0) {
      this.updateMarkers();
    }
  }
}
