import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';

const handledErrors = new Set<string>();

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastCtrl = inject(ToastController);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) return throwError(() => error);

      const key = `${error.status}-${req.url}`;
      if (handledErrors.has(key)) return throwError(() => error);
      handledErrors.add(key);
      setTimeout(() => handledErrors.delete(key), 3000);

      let message = 'Ocurrió un error inesperado';

      switch (error.status) {
        case 400:
          message = error.error?.message ?? 'Solicitud inválida';
          break;
        case 401:
          message = 'Sesión expirada. Inicia sesión nuevamente.';
          break;
        case 403:
          message = 'No tienes permiso para realizar esta acción.';
          break;
        case 404:
          message = 'Recurso no encontrado.';
          break;
        case 409:
          message = error.error?.message ?? 'Conflicto con los datos actuales.';
          break;
        case 422:
          message = error.error?.message ?? 'Datos de validación incorrectos.';
          break;
        case 500:
          message = 'Error del servidor. Intenta más tarde.';
          break;
      }

      toastCtrl
        .create({
          message,
          duration: 3500,
          position: 'bottom',
          color: error.status >= 500 ? 'danger' : 'warning',
        })
        .then((t) => t.present());

      return throwError(() => error);
    }),
  );
};
