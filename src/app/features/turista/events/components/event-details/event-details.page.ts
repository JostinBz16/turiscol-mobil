import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonChip,
  IonLabel,
  IonImg,
} from '@ionic/angular/standalone';
import { EventService } from 'src/app/core/services/event';
import { EventOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { EventOffer } from 'src/app/core/models/Offers';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner,
    IonChip,
    IonLabel,
    IonImg,
  ],
})
export class EventDetailsPage implements OnInit {
  event: EventOffer | null = null;
  loading = true;
  error = false;

  readonly EVENT_CATEGORY_LABELS: Record<string, string> = {
    CONCERT: 'Conciertos',
    WORKSHOP: 'Talleres',
    CONFERENCE: 'Conferencias',
    FESTIVAL: 'Festivales',
    ART_EXHIBITION: 'Exposiciones',
    CULTURAL: 'Cultural',
    FOOD: 'Gastronomía',
  };

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
    }
  }

  private loadEvent(id: string) {
    this.loading = true;
    this.error = false;

    this.eventService.getById(id).subscribe({
      next: (res: any) => {
        const adapter = new EventOfferAdapter();
        this.event = adapter.adapt(res);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  getCategoryLabel(cat: string): string {
    return this.EVENT_CATEGORY_LABELS[cat] || cat;
  }

  getMainImage(): string {
    if (!this.event?.images?.length) return '';
    return this.event.images[0];
  }
}
