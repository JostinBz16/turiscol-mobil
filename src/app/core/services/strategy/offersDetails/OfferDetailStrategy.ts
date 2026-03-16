import { Observable } from 'rxjs';

export interface OfferDetailStrategy<T> {
  getDetail(id: string): Observable<T>;
}
