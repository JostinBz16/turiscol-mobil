import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Event } from '../models/Event';
import { events } from '../data/EventMock';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private events$ = new BehaviorSubject<Event[]>(events);

  getAll() {
    return this.events$.asObservable();
  }

  getById(id: string) {
    return this.events$.value.find((e) => e.id === id);
  }

  getByCity(cityId: string) {
    return this.events$.value.filter((e) => e.cityId === cityId);
  }
}
