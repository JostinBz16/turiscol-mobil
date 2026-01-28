// auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { LoginResponse } from '../models/auth.models';
import { LoginRequestDTO } from '../models/login-request';

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
  }

  logout() {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getRole() {
    return localStorage.getItem('role');
  }
}
