import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ← NECESARIO
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-price-filter',
  templateUrl: './price-filter.component.html',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonItem,
    IonSelect,
    IonSelectOption,
  ],
})
export class CityFilterComponent implements OnInit {
  @Input() cityList: string[] = [];
  @Output() cityChange = new EventEmitter<string>();

  onCityChange(event: any) {
    this.cityChange.emit(event.detail.value);
  }

  ngOnInit() {
    console.log('cityList en CityFilterComponent:', this.cityList);
  }
}
