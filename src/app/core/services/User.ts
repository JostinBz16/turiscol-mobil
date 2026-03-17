import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/User';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API = `${environment.apiUrl}/users`;
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http
      .get<User>(`${this.API}/profile`)
      .pipe(tap((user) => this.currentUser$.next(user)));
  }

  updateProfile(user: Partial<User>): Observable<User> {
    return this.http
      .put<User>(`${this.API}/profile`, user)
      .pipe(tap((updatedUser) => this.currentUser$.next(updatedUser)));
  }

  // Backward compatibility or other uses if necessary
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }
}
