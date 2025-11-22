import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-price-filter',
  standalone: true,
  templateUrl: './price-filter.component.html',
  styleUrls: ['./price-filter.component.scss'],
  imports: [CommonModule, IonCard, IonCardContent, IonSelect, IonSelectOption],
})
export class CityFilterComponent implements OnInit {
  // Cities como array de objetos
  cities: any[] = [
    { id: 1, name: 'Bogotá', type: 'capital' },
    { id: 2, name: 'Medellín', type: 'ciudad' },
    { id: 3, name: 'Cali', type: 'ciudad' },
    { id: 4, name: 'Barranquilla', type: 'ciudad' },
  ];

  // Ciudad seleccionada como objeto
  @Input() selectedCity: any = null;

  // Evento cuando se selecciona una ciudad
  @Output() citySelected = new EventEmitter<any>();

  compareWith = (o1: any, o2: any): boolean => {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  };

  ngOnInit() {
    if (!this.selectedCity && this.cities.length > 0) {
      this.selectedCity = null;
    }
  }

  onCityChange(event: CustomEvent) {
    const id = event.detail.value;
    const selectedCity = this.cities.find((c) => c.id === id);
    this.citySelected.emit(selectedCity);
  }
}
