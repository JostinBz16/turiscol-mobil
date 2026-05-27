import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Department } from '../models/Deparment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly api = `${environment.apiUrl}/locations/departments`;

  constructor(private http: HttpClient) {}

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.api, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching departments', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching department', err);
        return throwError(() => err);
      }),
    );
  }

  getCitiesByDepartment(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}/cities`).pipe(
      catchError((err) => {
        console.error('Error fetching cities by department', err);
        return throwError(() => err);
      }),
    );
  }
}
