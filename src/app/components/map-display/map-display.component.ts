import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  ViewChild,
  ElementRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { IonSpinner } from '@ionic/angular/standalone';
import { MapProviderService } from 'src/app/core/services/map-provider.service';
import { Destination } from 'src/app/core/models/Destination';

let instanceCounter = 0;

@Component({
  selector: 'app-map-display',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.scss'],
  imports: [IonSpinner],
})
export class MapDisplayComponent implements OnInit, OnDestroy {
  @Input({ required: true }) destinations: Destination[] = [];
  @Input() loading = false;

  private _centerOn = signal<{ latitude: number; longitude: number } | null>(null);
  @Input() set centerOn(value: { latitude: number; longitude: number } | null) {
    this._centerOn.set(value);
  }

  @ViewChild('mapElement', { static: true }) mapElementRef!: ElementRef<HTMLElement>;

  private mapService = inject(MapProviderService);
  mapId = `map-display-${++instanceCounter}`;

  constructor() {
    effect(() => {
      const target = this._centerOn();
      if (target && this.mapService.isInitialized()) {
        this.mapService.setView(target.latitude, target.longitude, 15);
      }
    });
  }

  async ngOnInit() {
    await this.mapService.init(
      this.mapElementRef.nativeElement,
      this.mapId,
      { center: [4.5709, -74.2973], zoom: 6 },
    );
    await this.updateMarkers();
  }

  async ngOnDestroy() {
    await this.mapService.destroy();
  }

  async updateMarkers() {
    if (!this.mapService.isInitialized()) return;
    await this.mapService.addMarkers(this.destinations as any);
  }
}
