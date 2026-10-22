import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User, UserApi, RealmRole } from '../models/User';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private API = `${environment.apiUrl}/users`;
  user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  private currentUser$ = new BehaviorSubject<User | null>(null);

  getProfile(): Observable<User> {
    if (!this.user?.id) {
      return throwError(() => new Error('User ID no disponible'));
    }

    return this.http
      .get<User>(`${this.API}/profile/${this.user.id}`)
      .pipe(
        tap((user) => this.currentUser$.next(user)),
        catchError((err) => {
          console.error('Error fetching profile', err);
          return throwError(() => err);
        }),
      );
  }

  updateProfile(user: Partial<User>): Observable<User> {
    if (!this.user?.id) {
      return throwError(() => new Error('User ID no disponible'));
    }

    const payload = {
      ...user,
      userType: this.user.role === 'proveedor' ? 'PROVIDER' : 'TOURIST',
    };

    return this.http
      .put<User>(`${this.API}/${this.user.id}`, payload)
      .pipe(
        tap((updatedUser) => {
          this.currentUser$.next(updatedUser);
          this.user = { ...this.user!, ...updatedUser };
          localStorage.setItem('user', JSON.stringify(this.user));
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
