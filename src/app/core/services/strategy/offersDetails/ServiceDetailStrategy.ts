import { Injectable, inject } from '@angular/core';
import { OfferDetailStrategy } from './OfferDetailStrategy';
import { ServiceOffer } from 'src/app/core/models/Offers';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';
import { ServiceOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { ServiceDetailDto } from 'src/app/core/DTO/ServiceDetailDto';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiceDetailStrategy implements OfferDetailStrategy<ServiceOffer> {
  private http = inject(HttpClient);

  private adapter = new ServiceOfferAdapter();

  getDetail(id: string): Observable<ServiceOffer> {
    return this.http
      .get<ServiceDetailDto>(`${environment.apiUrl}/offers/${id}`)
      .pipe(
        map((dto) => this.adapter.adapt(dto)),
        catchError((err) => {
          console.error('Error fetching service detail', err);
          return throwError(() => err);
        }),
      );
  }
}
