import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const role = localStorage.getItem('role');
  const requiredRole = route.data?.['role'];

  if (role === requiredRole) {
    return true;
  }

  router.navigate(['/tabs/home']);
  return false;
};
