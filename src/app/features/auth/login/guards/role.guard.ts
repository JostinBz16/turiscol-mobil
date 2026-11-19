import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { hasSession } from 'src/app/core/guards/auth.guard';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  // No session (e.g. Back button after logout): go to login, not to the app.
  if (!hasSession()) {
    return router.createUrlTree(['/auth/login']);
  }

  const role = localStorage.getItem('role');
  const requiredRole = route.data?.['role'];

  if (role === requiredRole) {
    return true;
  }

  return router.createUrlTree(['/tabs/home']);
};
