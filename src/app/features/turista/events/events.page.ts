import { Component, OnInit, inject, signal } from '@angular/core';
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
  IonRouterLink,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EventListComponent } from './components/event-list/event-list.component';
import { addIcons } from 'ionicons';
import {
  filterOutline,
  refreshCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  person,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { EventService } from 'src/app/core/services/event';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';

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
    IonRouterLink,
    CitySelectorBarComponent,
    EventListComponent,
  ],
})
export class EventsPage implements OnInit {
  private eventService = inject(EventService);
  private selectedCityService = inject(SelectedCityService);

  city = this.selectedCityService.city;
  loading = signal(false);
  error = signal(false);
  errorMessage = '';

  allEvents: any[] = [];
  filteredEvents: any[] = [];

  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  selectedCategory = signal<string | null>(null);

  readonly monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  constructor(
    private router: Router,
    private navService: NavigationService,
  ) {}

  ngOnInit() {
    addIcons({
      filterOutline,
      refreshCircleOutline,
      chevronBackOutline,
      chevronForwardOutline,
      person,
    });
    this.loadEvents();
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
        this.allEvents = res.content || res || [];
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.errorMessage = 'Error al cargar eventos';
      },
    });
  }

  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.applyFilters();
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.applyFilters();
  }

  applyFilters() {
    const month = this.currentMonth();
    const year = this.currentYear();
    const category = this.selectedCategory();

    this.filteredEvents = this.allEvents.filter((ev) => {
      const eventDate = new Date(ev.eventDate || ev.date);
      if (eventDate.getMonth() !== month || eventDate.getFullYear() !== year) {
        return false;
      }
      if (category && ev.eventType !== category) {
        return false;
      }
      return true;
    });
  }

  setCategory(cat: string | null) {
    this.selectedCategory.set(cat);
    this.applyFilters();
  }

  goToDetail(id: string) {
    this.navService.setReturnUrl('/tabs/events');
    this.router.navigate(['/tabs/events', id]);
  }
}
