import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/User';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API = `${environment.apiUrl}/users`;
  user: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

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
    return this.http
      .put<User>(`${this.API}/profile`, user)
      .pipe(
        tap((updatedUser) => this.currentUser$.next(updatedUser)),
        catchError((err) => {
          console.error('Error updating profile', err);
          return throwError(() => err);
        }),
      );
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API).pipe(
      catchError((err) => {
        console.error('Error fetching users', err);
        return throwError(() => err);
      }),
    );
  }
}
