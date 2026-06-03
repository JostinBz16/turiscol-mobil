import { Injectable } from '@angular/core';
import { OfferDetailStrategy } from './OfferDetailStrategy';
import { ProductOffer } from 'src/app/core/models/Offers';
import { HttpClient } from '@angular/common/http';
import { map, Observable, catchError, throwError } from 'rxjs';
import { ProductOfferAdapter } from 'src/app/core/adapters/OfferDetailAdapter';
import { ProductDetailDto } from 'src/app/core/DTO/ProductDetailDto';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductDetailStrategy implements OfferDetailStrategy<ProductOffer> {
  private adapter = new ProductOfferAdapter();

  constructor(private http: HttpClient) {}

  getDetail(id: string): Observable<ProductOffer> {
    return this.http
      .get<ProductDetailDto>(`${environment.apiUrl}/offers/${id}`)
      .pipe(
        map((dto) => this.adapter.adapt(dto)),
        catchError((err) => {
          console.error('Error fetching product detail', err);
          return throwError(() => err);
        }),
      );
  }
}
