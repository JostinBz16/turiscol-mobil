import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { LoginRequestDTO } from '../models/login-request';
import { LoginResponse, UserSession } from '../models/auth.models';
import { RegisterRequestDTO } from '../../register/models/register-request';
import { environment } from 'src/environments/environment';

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
      .post<LoginResponse>(`${this.API}/register`, dto)
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
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);

    const decoded = this.decodeToken(res.access_token);
    if (decoded) {
      const user: UserSession = {
        id: decoded.sub,
        email: decoded.email || decoded.preferred_username,
        role: this.mapRole(decoded.realm_access?.roles || [])
      };
      localStorage.setItem('user', JSON.stringify(user));
      this.user.set(user);
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  private mapRole(roles: string[]): any {
    if (roles.includes('ADMIN')) return 'admin';
    if (roles.includes('PROVIDER')) return 'proveedor';
    return 'turista'; // Default or 'USER'/'CONSUMER'
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
