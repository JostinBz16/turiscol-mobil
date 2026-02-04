import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, tap, throwError } from 'rxjs';
import { LoginRequestDTO } from '../models/login-request';
import { LoginResponse, UserSession } from '../models/auth.models';
import { MOCK_USERS } from 'src/app/core/data/UserMock';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = '/api/v1/auth';

  constructor(private http: HttpClient) {}

  // 🔐 Estado central de sesión
  user = signal<UserSession | null>(null);

  // 👉 derivados (solo lectura)
  isAuthenticated = computed(() => !!this.user());
  role = computed(() => this.user()?.role ?? null);
  userId = computed(() => this.user()?.id ?? null);

  // ============================
  // LOGIN REAL (backend)
  // ============================
  loginWithPassword(dto: LoginRequestDTO) {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, dto)
      .pipe(tap((res) => this.storeSession(res)));
  }

  loginWithGoogle() {
    window.location.href = `${this.API}/google`;
  }

  // ============================
  // LOGIN MOCK (desarrollo)
  // ============================
  loginMocked(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

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

    // password mock explícito
    if (password !== '1234') {
      return throwError(() => ({
        status: 401,
        message: 'Credenciales inválidas',
      }));
    }

    const response: LoginResponse = {
      accessToken: 'mock-access-token-' + user.id,
      refreshToken: 'mock-refresh-token-' + user.id,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    return of(response).pipe(tap((res) => this.storeSession(res)));
  }

  // ============================
  // SESIÓN
  // ============================
  private storeSession(res: LoginResponse) {
    localStorage.setItem('access_token', res.accessToken);
    localStorage.setItem('refresh_token', res.refreshToken);
    localStorage.setItem('user', JSON.stringify(res.user));

    this.user.set(res.user);
  }

  loadFromStorage() {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      this.user.set(JSON.parse(rawUser));
    }
  }

  logout() {
    localStorage.clear();
    this.user.set(null);
  }
}
