import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const welcomeGuard: CanMatchFn = () => {
  const router = inject(Router);
  const shown = localStorage.getItem('welcomeShown');

  if (shown) {
    router.navigateByUrl('/auth/login', { replaceUrl: true });
    return false;
  }

  return true;
};
