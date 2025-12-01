import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashBinOutline } from 'ionicons/icons';

@Component({
  selector: 'app-city-filter',
  templateUrl: './city-filter.component.html',
  styleUrls: ['./city-filter.component.scss'],
  imports: [
    IonIcon,
    CommonModule,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
  ],
})
export class CityFilterComponent implements OnInit {
  cities: any[] = [
    { id: 1, name: 'Bogotá', type: 'capital' },
    { id: 2, name: 'Medellín', type: 'ciudad' },
    { id: 3, name: 'Cali', type: 'ciudad' },
    { id: 4, name: 'Barranquilla', type: 'ciudad' },
  ]; // Ciudad seleccionada como objeto

  @Input() selectedCity: any = null; // Evento cuando se selecciona una ciudad

  @Output() citySelected = new EventEmitter<any>(); // Función para comparar objetos, crucial cuando el valor es un objeto complejo

  @Output() clearFilter = new EventEmitter<void>();

  compareWith = (o1: any, o2: any): boolean => {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  };

  ngOnInit() {
    // Aseguramos que selectedCity sea null o el objeto si se pasa un valor
    if (!this.selectedCity && this.cities.length > 0) {
      this.selectedCity = null;
    }
    addIcons({
      trashBinOutline,
    });
  }

  onCityChange(event: CustomEvent) {
    // Dado que [value]="city" en la opción, event.detail.value ya es el objeto city
    // No es necesario buscarlo en el array cities
    this.citySelected.emit(event.detail.value);
  }

  onClear() {
    this.selectedCity = null;
    this.clearFilter.emit();
    this.citySelected.emit(null);
  }
}
