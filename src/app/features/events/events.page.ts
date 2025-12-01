import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { EventListComponent } from './components/event-list/event-list.component';
import { CityFilterComponent } from 'src/app/shared/components/city-filter/city-filter.component';
import { addIcons } from 'ionicons';
import { filterOutline, refreshCircleOutline } from 'ionicons/icons';
import { EventAdvanceFilterComponent } from './components/event-advance-filter/event-advance-filter.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    EventListComponent,
    CityFilterComponent,
    EventAdvanceFilterComponent,
  ],
})
export class EventsPage implements OnInit {
  selectedCity: any = null;

  showAdvancedFilter = false;

  events = [
    {
      id: 1,
      title: 'Festival del Café',
      city: 'Bogotá',
      date: '2025-04-12',
      status: 'activo',
      image: 'https://picsum.photos/300?1',
    },
    {
      id: 2,
      title: 'Feria de las Flores',
      city: 'Medellín',
      date: '2025-06-01',
      status: 'inactivo',
      image: 'https://picsum.photos/300?2',
    },
    {
      id: 3,
      title: 'Maratón de Cali',
      city: 'Cali',
      date: '2025-02-20',
      status: 'activo',
      image: 'https://picsum.photos/300?3',
    },
  ];

  filteredEvents: any[] = [];

  // Filtros avanzados
  dateFrom: string | null = null;
  dateTo: string | null = null;
  statusFilter = 'todos';

  constructor(private router: Router) {}

  ngOnInit() {
    addIcons({ filterOutline, refreshCircleOutline });
    this.applyFilters();
  }

  toggleAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  applyFilters() {
    this.filteredEvents = this.events
      .filter((ev) => !this.selectedCity || ev.city === this.selectedCity.name)
      .filter(
        (ev) => this.statusFilter === 'todos' || ev.status === this.statusFilter
      )
      .filter((ev) => !this.dateFrom || ev.date >= this.dateFrom)
      .filter((ev) => !this.dateTo || ev.date <= this.dateTo);
  }

  filterByCity(cityObj: any) {
    this.selectedCity = cityObj;
    this.applyFilters();
  }

  onDateFrom(value: string | null) {
    this.dateFrom = value;
    this.applyFilters();
  }

  onDateTo(value: string | null) {
    this.dateTo = value;
    this.applyFilters();
  }

  onStatusChange(value: string) {
    this.statusFilter = value;
    this.applyFilters();
  }

  toggleStatus(ev: any) {
    ev.status = ev.status === 'activo' ? 'inactivo' : 'activo';
    this.applyFilters();
  }

  resetCityFilter() {
    this.selectedCity = null;
    this.applyFilters();
  }

  goToDetails(id: number) {
    console.log('NAVEGAR A:', id);
    this.router.navigate(['/events/details', id]);
  }

  resetAdvancedFilters() {
    this.dateFrom = null;
    this.dateTo = null;
    this.statusFilter = 'todos';
    this.applyFilters();
  }
}
