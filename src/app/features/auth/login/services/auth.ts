import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, tap, throwError } from 'rxjs';
import { LoginRequestDTO } from '../models/login-request';
import { LoginResponse, UserSession } from '../models/auth.models';
import { environment } from 'src/environments/environment';
import { RegisterRequestDTO } from '../../register/models/register-request';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // 🔐 Estado central de sesión
  user = signal<UserSession | null>(null);

  // 👉 derivados (solo lectura)
  isAuthenticated = computed(() => !!this.user());
  role = computed(() => this.user()?.role ?? null);
  userId = computed(() => this.user()?.id ?? null);

  loginWithPassword(dto: LoginRequestDTO) {
    return this.http
      .post<LoginResponse>(`${this.API}/login`, dto)
      .pipe(tap((res) => this.storeSession(res)));
  }

  register(dto: RegisterRequestDTO) {
    return this.http
      .post<LoginResponse>(`${this.API}/auth/register`, dto)
      .pipe(tap((res) => this.storeSession(res)));
  }

  // ============================
  // LOGIN MOCK (desarrollo) - Deprecated
  // ============================
  loginMocked(email: string, password: string) {
    console.warn('loginMocked is deprecated. Use loginWithPassword instead.');
    // Keep for backward compatibility if needed, but pointing to real one or keeping logic
    return this.loginWithPassword({ email, password });
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
