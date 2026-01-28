// auth/services/auth.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, of, tap, throwError } from 'rxjs';
import { LoginResponse } from '../models/auth.models';
import { LoginRequestDTO } from '../models/login-request';
import { MOCK_USERS } from 'src/app/core/data/UserMock';
import { Role } from 'src/app/core/models/User';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = '/api/v1/auth';

  constructor(private http: HttpClient) {}

  loginWithPassword(dto: LoginRequestDTO) {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, dto)
      .pipe(tap((res) => this.storeSession(res)));
  }

  loginWithGoogle() {
    // Aquí normalmente rediriges al backend
    window.location.href = `${this.API}/google`;
  }
  storeSession(res: LoginResponse) {
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('role', res.role);

    // 🔥 ESTO ES LO QUE FALTABA
    this.role.set(res.role);
  }

  role = signal<Role | null>(null);

  setRole(role: Role) {
    this.role.set(role);
    localStorage.setItem('role', role);
  }

  loadFromStorage() {
    const role = localStorage.getItem('role') as Role | null;
    if (role) this.role.set(role);
  }

  logout() {
    this.role.set(null);
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  loginMocked(email: string, password: string) {
    const user = MOCK_USERS.find((u) => u.email === email);

    if (!user) {
      return throwError(() => ({
        status: 401,
        message: 'Usuario no encontrado',
      }));
    }

    if (!user.active) {
      return throwError(() => ({
        status: 403,
        message: 'Usuario inactivo',
      }));
    }

    const response: LoginResponse = {
      accessToken: 'mock-access-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id,
      role: user.role,
    };

    return of(response).pipe(tap((res) => this.storeSession(res)));
  }
}
