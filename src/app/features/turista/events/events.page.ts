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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
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
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';
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
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CitySelectorBarComponent,
    EventListComponent,
    FestivityListComponent,
    ChatFabComponent,
  ],
})
export class EventsPage implements OnInit {
  private router = inject(Router);
  private navService = inject(NavigationService);

  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private festivityService = inject(FestivityService);
  private selectedCityService = inject(SelectedCityService);

  private readonly pageSize = 10;

  city = this.selectedCityService.city;
  loading = signal(false);
  error = signal(false);
  errorMessage = '';

  viewMode = signal<'events' | 'festivities'>('events');

  filteredEvents: any[] = [];
  allFestivities: Festivity[] = [];

  selectedCategory = signal<string | null>(null);

  eventCategories: string[] = [];

  eventsPage = 0;
  eventsHasMore = signal(true);
  eventsLoadingMore = signal(false);

  festivitiesPage = 0;
  festivitiesHasMore = signal(true);
  festivitiesLoadingMore = signal(false);

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

  loadEvents(reset = true) {
    if (reset) {
      this.eventsPage = 0;
      this.filteredEvents = [];
      this.loading.set(true);
      this.eventsLoadingMore.set(false);
    } else {
      this.eventsPage++;
      this.eventsLoadingMore.set(true);
    }

    this.error.set(false);

    const currentCity = this.city();
    const category = this.selectedCategory();
    const pageParams = { page: this.eventsPage, size: this.pageSize };
    const catParams = category ? { ...pageParams, category } : pageParams;

    const obs = currentCity
      ? this.eventService.getByCity(currentCity.id, catParams)
      : this.eventService.getAll(catParams);

    obs.subscribe({
      next: (res: any) => {
        const content = res.content || res || [];
        const items = content.filter((item: any) => item.cityId || item);
        if (reset) {
          this.filteredEvents = items;
        } else {
          this.filteredEvents = [...this.filteredEvents, ...items];
        }
        this.eventsHasMore.set(!res.last && content.length === this.pageSize);
        this.loading.set(false);
        this.eventsLoadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.eventsLoadingMore.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar eventos';
      },
    });
  }

  loadMoreEvents(event: any) {
    this.loadEvents(false);
    event.target.complete();
  }

  loadFestivities(reset = true) {
    if (reset) {
      this.festivitiesPage = 0;
      this.allFestivities = [];
      this.loading.set(true);
      this.festivitiesLoadingMore.set(false);
    } else {
      this.festivitiesPage++;
      this.festivitiesLoadingMore.set(true);
    }

    this.error.set(false);

    const currentCity = this.city();

    const obs = currentCity
      ? this.festivityService.getByCity(currentCity.id, { page: this.festivitiesPage, size: this.pageSize })
      : this.festivityService.getAll({ page: this.festivitiesPage, size: this.pageSize });

    obs.subscribe({
      next: (res: any) => {
        const content = res.content || res || [];
        if (reset) {
          this.allFestivities = content;
        } else {
          this.allFestivities = [...this.allFestivities, ...content];
        }
        this.festivitiesHasMore.set(!res.last && content.length === this.pageSize);
        this.loading.set(false);
        this.festivitiesLoadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.festivitiesLoadingMore.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar festividades';
      },
    });
  }

  loadMoreFestivities(event: any) {
    this.loadFestivities(false);
    event.target.complete();
  }

  switchView(mode: 'events' | 'festivities') {
    this.viewMode.set(mode);
    this.selectedCategory.set(null);

    if (mode === 'events') {
      this.loadEvents();
    } else {
      this.loadFestivities();
    }
  }

  setCategory(cat: string | null) {
    this.selectedCategory.set(cat);
    if (this.viewMode() === 'events') {
      this.loadEvents();
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
