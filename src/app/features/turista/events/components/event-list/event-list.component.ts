import { Component, Input } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonChip,
  IonLabel,
  IonImg,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

const EVENT_CATEGORY_LABELS: Record<string, string> = {
  CONCERT: 'Conciertos',
  WORKSHOP: 'Talleres',
  CONFERENCE: 'Conferencias',
  FESTIVAL: 'Festivales',
  ART_EXHIBITION: 'Exposiciones',
  CULTURAL: 'Cultural',
  FOOD: 'Gastronomía',
};

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    IonImg,
    CommonModule,
    IonCard,
    IonCardContent,
    IonChip,
    IonLabel,
    RouterLink,
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent {
  @Input() events: any[] = [];

  getCategoryLabel(cat: string): string {
    return EVENT_CATEGORY_LABELS[cat] || cat;
  }

  getImage(e: any): string {
    if (e.images?.length) return e.images[0];
    if (typeof e.image === 'string') return e.image;
    return '';
  }

  getName(e: any): string {
    return e.name || e.title || '';
  }

  getDescription(e: any): string {
    return e.description || '';
  }

  getDate(e: any): string {
    return e.eventDate || e.date || '';
  }

  getPrice(e: any): number | null {
    return e.ticketPrice ?? e.basePrice ?? e.baseprice ?? null;
  }

  getLocation(e: any): string {
    return e.cityName || e.city || '';
  }
}
