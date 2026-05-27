import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly api = `${environment.apiUrl}/offers`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/type/EVENT`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching events', err);
        return throwError(() => err);
      }),
    );
  }

  getActive(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/type/EVENT/active`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching active events', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching event detail', err);
        return throwError(() => err);
      }),
    );
  }

  getByCity(cityId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/city/${cityId}`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching events by city', err);
        return throwError(() => err);
      }),
    );
  }
}
