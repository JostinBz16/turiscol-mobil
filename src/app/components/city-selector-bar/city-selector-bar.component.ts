import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, chevronDownOutline } from 'ionicons/icons';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { DepartmentService } from 'src/app/core/services/DepartmentService';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-city-bar',
  standalone: true,
  templateUrl: './city-selector-bar.component.html',
  styleUrls: ['./city-selector-bar.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonModal,
  ],
})
export class CitySelectorBarComponent implements OnInit {
  private municipalityService = inject(MunicipalityService);
  private departmentService = inject(DepartmentService);
  private selectedCityService = inject(SelectedCityService);

  city = this.selectedCityService.city;
  isOpen = signal(false);
  searchText = signal('');
  results = signal<any[]>([]);
  departmentMap = new Map<string, string>();

  constructor() {
    addIcons({ locationOutline, chevronDownOutline });
  }

  async ngOnInit() {
    try {
      const depts = await firstValueFrom(this.departmentService.getAll());
      const list = depts.content ?? depts;
      list.forEach((dep: any) => {
        this.departmentMap.set(dep.id, dep.name);
      });
    } catch {}
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
    this.searchText.set('');
    this.results.set([]);
  }

  async search() {
    const q = this.searchText();
    if (q.length < 2) {
      this.results.set([]);
      return;
    }
    try {
      const res = await firstValueFrom(this.municipalityService.search(q));
      this.results.set(res.content ?? res ?? []);
    } catch {
      this.results.set([]);
    }
  }

  select(city: any) {
    this.selectedCityService.select(city);
    this.close();
  }

  clear() {
    this.selectedCityService.clear();
    this.close();
  }

  getDepartmentName(departmentId?: string): string {
    return departmentId ? (this.departmentMap.get(departmentId) ?? '') : '';
  }
}
