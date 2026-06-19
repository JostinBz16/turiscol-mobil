import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/locations/destinations`;

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching destinations', err);
        return throwError(() => err);
      }),
    );
  }

  getByCity(cityId: string | number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/locations/cities/${cityId}/destinations`).pipe(
      catchError((err) => {
        console.error('Error fetching destinations by city', err);
        return throwError(() => err);
      }),
    );
  }

  getByCityAndType(cityId: string | number, type: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/locations/cities/${cityId}/destinations/type/${type}`).pipe(
      catchError((err) => {
        console.error('Error fetching destinations by city and type', err);
        return throwError(() => err);
      }),
    );
  }

  getFeatured(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/featured`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching featured destinations', err);
        return throwError(() => err);
      }),
    );
  }
}
