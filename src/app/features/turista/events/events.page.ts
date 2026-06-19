import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonSpinner,
  IonIcon,
  IonChip,
  IonLabel,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EventListComponent } from './components/event-list/event-list.component';
import { FestivityListComponent } from './components/festivity-list/festivity-list.component';
import { addIcons } from 'ionicons';
import {
  filterOutline,
  refreshCircleOutline,
  person,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { EventService } from 'src/app/core/services/event';
import { CategoryService } from 'src/app/core/services/category.service';
import { FestivityService } from 'src/app/core/services/festivity.service';
import { Festivity } from 'src/app/core/models/Festivity';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';
import { firstValueFrom } from 'rxjs';

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
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonButton,
    IonSpinner,
    IonIcon,
    IonChip,
    IonLabel,
    IonButtons,
    CitySelectorBarComponent,
    EventListComponent,
    FestivityListComponent,
  ],
})
export class EventsPage implements OnInit {
  private router = inject(Router);
  private navService = inject(NavigationService);

  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private festivityService = inject(FestivityService);
  private selectedCityService = inject(SelectedCityService);

  city = this.selectedCityService.city;
  loading = signal(false);
  error = signal(false);
  errorMessage = '';

  viewMode = signal<'events' | 'festivities'>('events');

  allEvents: any[] = [];
  filteredEvents: any[] = [];

  allFestivities: Festivity[] = [];

  selectedCategory = signal<string | null>(null);

  eventCategories: string[] = [];

  readonly EVENT_CATEGORY_LABELS = EVENT_CATEGORY_LABELS;

  constructor() {
    addIcons({
      filterOutline,
      refreshCircleOutline,
      person,
    });

    effect(() => {
      this.city();
      untracked(() => {
        if (this.viewMode() === 'events') {
          this.loadEvents();
        } else {
          this.loadFestivities();
        }
      });
    });
  }

  ngOnInit() {
    this.loadEventCategories();
  }

  async loadEventCategories() {
    try {
      const categories = await firstValueFrom(this.categoryService.getByType('event'));
      this.eventCategories = categories;
    } catch {
      this.eventCategories = [];
    }
  }

  loadEvents() {
    this.loading.set(true);
    this.error.set(false);

    const currentCity = this.city();
    const obs = currentCity
      ? this.eventService.getByCity(currentCity.id)
      : this.eventService.getAll();

    obs.subscribe({
      next: (res: any) => {
        const raw = res.content || res || [];
        this.allEvents = raw.filter((item: any) => item.cityId || item);
        this.filterEvents();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar eventos';
      },
    });
  }

  loadFestivities() {
    this.loading.set(true);
    this.error.set(false);

    const currentCity = this.city();

    const obs = currentCity
      ? this.festivityService.getByCity(currentCity.id)
      : this.festivityService.getAll();

    obs.subscribe({
      next: (res: any) => {
        this.allFestivities = res.content || res || [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar festividades';
      },
    });
  }

  switchView(mode: 'events' | 'festivities') {
    this.viewMode.set(mode);
    this.selectedCategory.set(null);

    if (mode === 'events') {
      this.filterEvents();
    } else if (this.allFestivities.length === 0) {
      this.loadFestivities();
    }
  }

  filterEvents() {
    const category = this.selectedCategory();
    this.filteredEvents = category
      ? this.allEvents.filter((ev) => ev.eventType === category)
      : [...this.allEvents];
  }

  setCategory(cat: string | null) {
    this.selectedCategory.set(cat);

    if (this.viewMode() === 'events') {
      this.filterEvents();
    }
  }

  goToProfile() {
    localStorage.setItem('account_return_url', '/tabs/events');
    this.router.navigate(['/tabs/account']);
  }

  goToDetail(id: string) {
    this.navService.setReturnUrl('/tabs/events');
    this.router.navigate(['/tabs/events', id]);
  }
}
