import { Injectable } from '@angular/core';
import { GoogleMap, Marker, LatLngBounds } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  description?: string;
  type: string;
}

export interface MapInitOptions {
  center: [number, number];
  zoom: number;
}

@Injectable({ providedIn: 'root' })
export class MapProviderService {
  private map: GoogleMap | null = null;
  private markerIds: string[] = [];

  private readonly typeColors: Record<string, string> = {
    MUSEUM: '#e74c3c',
    PARK: '#27ae60',
    BEACH: '#3498db',
    HISTORICAL_SITE: '#f39c12',
    NATURAL_RESERVE: '#2ecc71',
    VIEWPOINT: '#9b59b6',
    SPOT: '#e67e22',
  };

  async init(element: HTMLElement, elementId: string, options: MapInitOptions): Promise<void> {
    if (this.map) return;

    this.map = await GoogleMap.create({
      id: elementId,
      apiKey: environment.googleMapsApiKey,
      element,
      config: {
        center: { lat: options.center[0], lng: options.center[1] },
        zoom: options.zoom,
      },
      forceCreate: true,
    });
  }

  async addMarkers(data: MapMarkerData[]): Promise<void> {
    if (!this.map) return;

    await this.clearMarkers();

    const markers: Marker[] = [];
    const coords: { lat: number; lng: number }[] = [];

    for (const d of data) {
      if (!d.latitude || !d.longitude) continue;

      const color = this.typeColors[d.type] || '#666';

      markers.push({
        coordinate: { lat: d.latitude, lng: d.longitude },
        title: d.name,
        snippet: d.description ? `${d.description}\n${d.type}` : d.type,
        iconUrl: this.createPinSvgDataUrl(color),
        tintColor: this.hexToRgba(color),
        iconSize: { width: 24, height: 36 },
        iconAnchor: { x: 12, y: 36 },
      });

      coords.push({ lat: d.latitude, lng: d.longitude });
    }

    if (markers.length > 0) {
      this.markerIds = await this.map.addMarkers(markers);

      if (coords.length > 1) {
        const bounds = this.calculateBounds(coords);
        await this.map.fitBounds(bounds, 50);
      } else {
        await this.map.setCamera({ coordinate: coords[0], zoom: 15 });
      }
    }
  }

  async clearMarkers(): Promise<void> {
    if (!this.map || this.markerIds.length === 0) return;
    await this.map.removeMarkers(this.markerIds);
    this.markerIds = [];
  }

  async setView(lat: number, lng: number, zoom?: number): Promise<void> {
    if (!this.map) return;
    await this.map.setCamera({ coordinate: { lat, lng }, zoom: zoom ?? 14 });
  }

  async destroy(): Promise<void> {
    await this.clearMarkers();
    if (this.map) {
      await this.map.destroy();
      this.map = null;
    }
  }

  isInitialized(): boolean {
    return this.map !== null;
  }

  private createPinSvgDataUrl(color: string): string {
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">',
      '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="',
      color.replace(/"/g, '&quot;'),
      '" stroke="#fff" stroke-width="2"/>',
      '<circle cx="12" cy="12" r="5" fill="#fff"/>',
      '</svg>',
    ].join('');
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  private hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return match
      ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16), a: 255 }
      : { r: 102, g: 102, b: 102, a: 255 };
  }

  private calculateBounds(coords: { lat: number; lng: number }[]): LatLngBounds {
    let minLat = coords[0].lat, maxLat = coords[0].lat;
    let minLng = coords[0].lng, maxLng = coords[0].lng;

    for (const c of coords) {
      if (c.lat < minLat) minLat = c.lat;
      if (c.lat > maxLat) maxLat = c.lat;
      if (c.lng < minLng) minLng = c.lng;
      if (c.lng > maxLng) maxLng = c.lng;
    }

    return new LatLngBounds({
      southwest: { lat: minLat, lng: minLng },
      center: { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 },
      northeast: { lat: maxLat, lng: maxLng },
    });
  }
}
