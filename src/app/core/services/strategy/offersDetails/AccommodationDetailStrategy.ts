import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AccommodationOffer } from '../../../models/Offers';
import { OfferDetailStrategy } from './OfferDetailStrategy';
import { map, Observable, catchError, throwError } from 'rxjs';
import { AccommodationOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { AccommodationDetailDto } from 'src/app/core/DTO/AccommodationDetailDto';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AccommodationDetailStrategy implements OfferDetailStrategy<AccommodationOffer> {
  private http = inject(HttpClient);

  private adapter = new AccommodationOfferAdapter();

  getDetail(id: string): Observable<AccommodationOffer> {
    return this.http
      .get<AccommodationDetailDto>(`${environment.apiUrl}/offers/${id}`)
      .pipe(
        map((dto) => this.adapter.adapt(dto)),
        catchError((err) => {
          console.error('Error fetching accommodation detail', err);
          return throwError(() => err);
        }),
      );
  }
}
