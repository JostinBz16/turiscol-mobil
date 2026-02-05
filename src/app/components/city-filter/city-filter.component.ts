import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-city-filter',
  templateUrl: './city-filter.component.html',
  styleUrls: ['./city-filter.component.scss'],
  imports: [IonInput, CommonModule, IonCard, IonCardContent, IonIcon],
})
export class CityFilterComponent {
  @Output() select = new EventEmitter<any>();

  cities: any[] = [
    { id: 1, name: 'Bogotá', type: 'capital' },
    { id: 2, name: 'Medellín', type: 'ciudad' },
    { id: 3, name: 'Cali', type: 'ciudad' },
    { id: 4, name: 'Barranquilla', type: 'ciudad' },
  ];

  filter = '';

  get filteredCities() {
    return this.cities.filter((c) =>
      c.name.toLowerCase().includes(this.filter.toLowerCase()),
    );
  }

  onSelect(city: any) {
    this.select.emit(city);
  }

  onFilterChange(event: CustomEvent) {
    this.filter = (event.detail?.value ?? '').toString();
  }
}
