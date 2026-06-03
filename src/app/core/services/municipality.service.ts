import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { Municipality } from '../models/Municipality';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MunicipalityService {
  private readonly api = `${environment.apiUrl}/locations/cities`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching municipalities', err);
        return throwError(() => err);
      }),
    );
  }

  getByDepartment(departmentId: string, params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(`${environment.apiUrl}/locations/departments/${departmentId}/cities`, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching municipalities by department', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<Municipality> {
    return this.http.get<Municipality>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching municipality', err);
        return throwError(() => err);
      }),
    );
  }

  getByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.api}/by-name/${encodeURIComponent(name)}`).pipe(
      catchError((err) => {
        console.error('Error searching municipality by name', err);
        return throwError(() => err);
      }),
    );
  }

  getByNameAndDepartment(name: string, departmentId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/by-name/${name}/department/${departmentId}`).pipe(
      catchError((err) => {
        console.error('Error searching municipality', err);
        return throwError(() => err);
      }),
    );
  }

  getDestinationsByCity(cityId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${cityId}/destinations`).pipe(
      catchError((err) => {
        console.error('Error fetching destinations by city', err);
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
        console.error('Error fetching featured cities', err);
        return throwError(() => err);
      }),
    );
  }
}
