import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonImg, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mapOutline } from 'ionicons/icons';
import { Destination } from 'src/app/core/models/Destination';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  templateUrl: './destination-card.component.html',
  styleUrls: ['./destination-card.component.scss'],
  imports: [CommonModule, IonImg, IonIcon],
})
export class DestinationCardComponent {
  @Input({ required: true }) destination!: Destination;
  @Output() showOnMap = new EventEmitter<Destination>();

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

  constructor() {
    addIcons({ mapOutline });
  }

  getTypeLabel(type: string): string {
    return this.typeLabels[type] || type;
  }

  getTypeColor(type: string): string {
    return this.typeColors[type] || '#666';
  }

  onShowOnMap() {
    this.showOnMap.emit(this.destination);
  }
}
