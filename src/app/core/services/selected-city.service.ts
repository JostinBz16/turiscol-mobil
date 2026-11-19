import { Injectable, inject, signal } from '@angular/core';
import { Municipality } from '../models/Municipality';
import { AuthService } from 'src/app/features/auth/login/services/auth';

@Injectable({ providedIn: 'root' })
export class SelectedCityService {
  private readonly storageKey = 'selectedCity';
  private auth = inject(AuthService);

  city = signal<Municipality | null>(null);

  constructor() {
    // La ciudad elegida pertenece a la sesión: se limpia al cerrar sesión.
    this.auth.onLogout(() => this.clear());

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
