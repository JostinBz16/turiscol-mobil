import { Injectable, inject } from '@angular/core';
import { OfferDetailStrategy } from './OfferDetailStrategy';
import { EventOffer } from 'src/app/core/models/Offers';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';
import { EventOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { EventDetailDto } from 'src/app/core/DTO/EventDetailDto';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EventDetailStrategy implements OfferDetailStrategy<EventOffer> {
  private http = inject(HttpClient);

  private adapter = new EventOfferAdapter();

  getDetail(id: string): Observable<EventOffer> {
    return this.http
      .get<EventDetailDto>(`${environment.apiUrl}/offers/${id}`)
      .pipe(
        map((dto) => this.adapter.adapt(dto)),
        catchError((err) => {
          console.error('Error fetching event detail', err);
          return throwError(() => err);
        }),
      );
  }
}
