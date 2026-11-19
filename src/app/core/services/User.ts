import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, UserApi, RealmRole, UserStats } from '../models/User';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private API = `${environment.apiUrl}/users`;
  /**
   * Usuario de la sesión actual. Se lee siempre de localStorage (fuente de
   * verdad de la sesión) para no conservar el usuario anterior en memoria
   * tras un logout/login.
   */
  get user(): User | null {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  getProfile(): Observable<User> {
    const current = this.user;
    if (!current?.id) {
      return throwError(() => new Error('User ID no disponible'));
    }

    return this.http
      .get<User>(`${this.API}/profile/${current.id}`)
      .pipe(
        catchError((err) => {
          console.error('Error fetching profile', err);
          return throwError(() => err);
        }),
      );
  }

  updateProfile(user: Partial<User>): Observable<User> {
    const current = this.user;
    if (!current?.id) {
      return throwError(() => new Error('User ID no disponible'));
    }

    const payload = {
      ...user,
      userType: current.role === 'proveedor' ? 'PROVIDER' : 'TOURIST',
    };

    return this.http
      .put<User>(`${this.API}/${current.id}`, payload)
      .pipe(
        tap((updatedUser) => {
          localStorage.setItem(
            'user',
            JSON.stringify({ ...current, ...updatedUser }),
          );
        }),
        catchError((err) => {
          console.error('Error updating profile', err);
          return throwError(() => err);
        }),
      );
  }

  getAll(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.API, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching users', err);
        return throwError(() => err);
      }),
    );
  }

  getById(id: string): Observable<UserApi> {
    return this.http.get<UserApi>(`${this.API}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching user', err);
        return throwError(() => err);
      }),
    );
  }

  getByRole(
    role: UserApi['role'],
    params?: { page?: number; size?: number },
  ): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http
      .get<any>(`${this.API}/role/${role}`, { params: httpParams })
      .pipe(
        catchError((err) => {
          console.error('Error fetching users by role', err);
          return throwError(() => err);
        }),
      );
  }

  activate(id: string): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/activate`, {}).pipe(
      catchError((err) => {
        console.error('Error activating user', err);
        return throwError(() => err);
      }),
    );
  }

  deactivate(id: string): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/deactivate`, {}).pipe(
      catchError((err) => {
        console.error('Error deactivating user', err);
        return throwError(() => err);
      }),
    );
  }

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API}/stats`).pipe(
      catchError((err) => {
        console.error('Error fetching user stats', err);
        return throwError(() => err);
      }),
    );
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/roles`).pipe(
      catchError((err) => {
        console.error('Error fetching roles', err);
        return throwError(() => err);
      }),
    );
  }

  updateRole(id: string, role: RealmRole): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/role`, { role }).pipe(
      catchError((err) => {
        console.error('Error updating user role', err);
        return throwError(() => err);
      }),
    );
  }
}
