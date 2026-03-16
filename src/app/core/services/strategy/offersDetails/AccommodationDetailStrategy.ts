import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccommodationOffer } from '../../../models/Offers';
import { OfferDetailStrategy } from './OfferDetailStrategy';
import { map, Observable } from 'rxjs';
import { AccommodationOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { AccommodationDetailDto } from 'src/app/core/DTO/AccommodationDetailDto';

@Injectable()
export class AccommodationDetailStrategy implements OfferDetailStrategy<AccommodationOffer> {
  private adapter = new AccommodationOfferAdapter();

  constructor(private http: HttpClient) {}

  getDetail(id: string): Observable<AccommodationOffer> {
    return this.http
      .get<AccommodationDetailDto>(`/api/accommodations/${id}`)
      .pipe(map((dto) => this.adapter.adapt(dto)));
  }
}
