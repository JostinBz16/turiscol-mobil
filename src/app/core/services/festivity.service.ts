import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Festivity } from '../models/Festivity';

export interface FestivityRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  cityId: number;
  image: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FestivityService {
  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/festivities`;

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

  getByCity(cityId: string | number, params?: { page?: number; size?: number }): Observable<any> {
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

  create(dto: FestivityRequest): Observable<Festivity> {
    return this.http.post<Festivity>(this.api, dto).pipe(
      catchError((err) => {
        console.error('Error creating festivity', err);
        return throwError(() => err);
      }),
    );
  }

  update(id: string, dto: FestivityRequest): Observable<Festivity> {
    return this.http.put<Festivity>(`${this.api}/${id}`, dto).pipe(
      catchError((err) => {
        console.error('Error updating festivity', err);
        return throwError(() => err);
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting festivity', err);
        return throwError(() => err);
      }),
    );
  }
}
