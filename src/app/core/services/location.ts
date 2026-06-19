import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/locations`;

  getDepartments(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/departments`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching departments', err);
        return throwError(() => err);
      }),
    );
  }

  getCitiesByDepartment(departmentId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/departments/${departmentId}/cities`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching cities by department', err);
        return throwError(() => err);
      }),
    );
  }

  getAllCities(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${this.api}/cities`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching cities', err);
        return throwError(() => err);
      }),
    );
  }
}
