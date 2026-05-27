import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Price } from '../models/Price';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PriceService {
  private readonly api = `${environment.apiUrl}/prices`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching prices', err);
        return throwError(() => err);
      }),
    );
  }

  getActive(): Observable<any> {
    return this.http.get<any>(`${this.api}/active`).pipe(
      catchError((err) => {
        console.error('Error fetching active prices', err);
        return throwError(() => err);
      }),
    );
  }

  getPricesByMunicipality(municipalityId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/city/${municipalityId}`).pipe(
      catchError((err) => {
        console.error('Error fetching prices by municipality', err);
        return throwError(() => err);
      }),
    );
  }

  getByCategory(categoryName: string): Observable<any> {
    return this.http.get<any>(`${this.api}/category/${categoryName}`).pipe(
      catchError((err) => {
        console.error('Error fetching prices by category', err);
        return throwError(() => err);
      }),
    );
  }

  getByRange(min: number, max: number): Observable<any> {
    const params = new HttpParams().set('min', min).set('max', max);
    return this.http.get<any>(`${this.api}/range`, { params }).pipe(
      catchError((err) => {
        console.error('Error fetching prices by range', err);
        return throwError(() => err);
      }),
    );
  }
}
