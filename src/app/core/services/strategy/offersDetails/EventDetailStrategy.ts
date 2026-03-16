import { Injectable } from '@angular/core';
import { OfferDetailStrategy } from './OfferDetailStrategy';
import { EventOffer } from 'src/app/core/models/Offers';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { EventOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { EventDetailDto } from 'src/app/core/DTO/EventDetailDto';

@Injectable()
export class EventDetailStrategy implements OfferDetailStrategy<EventOffer> {
  private adapter = new EventOfferAdapter();

  constructor(private http: HttpClient) {}

  getDetail(id: string): Observable<EventOffer> {
    return this.http
      .get<EventDetailDto>(`/api/events/${id}`)
      .pipe(map((dto) => this.adapter.adapt(dto)));
  }
}
