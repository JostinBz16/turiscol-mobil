import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const token = localStorage.getItem('access_token');

  // No añadir el token si la petición es para autenticación (login/register/refresh)
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // Añade el token si existe y la petición va a nuestra API
  if (token && req.url.startsWith(environment.apiUrl)) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es 401 y no estamos refrescando, intentar refresh
        if (error.status === 401 && !isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            return http
              .post(`${environment.apiUrl}/auth/refresh`, refreshToken)
              .pipe(
                switchMap((res: any) => {
                  isRefreshing = false;
                  localStorage.setItem('access_token', res.access_token);
                  localStorage.setItem('refresh_token', res.refresh_token);
                  const newReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${res.access_token}`,
                    },
                  });
                  return next(newReq);
                }),
                catchError((refreshError) => {
                  isRefreshing = false;
                  localStorage.clear();
                  window.location.href = '/auth/login';
                  return throwError(() => refreshError);
                }),
              );
          }
        }
        isRefreshing = false;
        return throwError(() => error);
      }),
    );
  }

  return next(req);
};
