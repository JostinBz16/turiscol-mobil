import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { services } from '../data/ServiceMock';
import { Service } from '../models/Service';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private services$ = new BehaviorSubject<Service[]>(services);

  getAll() {
    return this.services$.asObservable();
  }

  getById(id: string) {
    return this.services$.value.find((s) => s.id === id);
  }

  getByCity(cityId: string) {
    return this.services$.value.filter((s) => s.cityId === cityId);
  }
}
