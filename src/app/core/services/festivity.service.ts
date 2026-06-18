import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Festivity } from '../models/Festivity';

@Injectable({
  providedIn: 'root',
})
export class FestivityService {
  private readonly api = `${environment.apiUrl}/festivities`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching festivities', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<Festivity> {
    return this.http.get<Festivity>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching festivity detail', err);
        return throwError(() => err);
      }),
    );
  }

  getByCity(cityId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/by-city/${cityId}`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching festivities by city', err);
        return throwError(() => err);
      }),
    );
  }

  getUpcoming(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/upcoming`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching upcoming festivities', err);
        return throwError(() => err);
      }),
    );
  }
}
