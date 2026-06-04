import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
} from '@ionic/angular/standalone';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-city-filter',
  templateUrl: './city-filter.component.html',
  styleUrls: ['./city-filter.component.scss'],
  imports: [IonInput, CommonModule, IonCard, IonCardContent, IonIcon],
})
export class CityFilterComponent implements OnInit {
  @Output() select = new EventEmitter<any>();

  cities: any[] = [];

  constructor(private municipalityService: MunicipalityService) {}

  async ngOnInit() {
    await this.loadFeatured();
  }

  private async loadFeatured() {
    try {
      const res = await firstValueFrom(this.municipalityService.getFeatured());
      const list = res.content ?? res;
      this.cities = Array.isArray(list) ? list : [];
    } catch {
      this.cities = [];
    }
  }

  async onFilterChange(event: CustomEvent) {
    const value = (event.detail?.value ?? '').toString();
    if (!value) {
      await this.loadFeatured();
      return;
    }
    try {
      const res = await firstValueFrom(this.municipalityService.search(value));
      this.cities = res.content ?? [];
    } catch {
      this.cities = [];
    }
  }

  onSelect(city: any) {
    this.select.emit(city);
  }
}
