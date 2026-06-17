import { Injectable, signal } from '@angular/core';
import { Municipality } from '../models/Municipality';

@Injectable({ providedIn: 'root' })
export class SelectedCityService {
  private readonly storageKey = 'selectedCity';

  city = signal<Municipality | null>(null);

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.city.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem(this.storageKey);
      }
    }
  }

  select(city: Municipality) {
    this.city.set(city);
    localStorage.setItem(this.storageKey, JSON.stringify(city));
  }

  clear() {
    this.city.set(null);
    localStorage.removeItem(this.storageKey);
  }
}
