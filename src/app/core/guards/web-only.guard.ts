import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export const webOnlyGuard: CanMatchFn = () => {
  const router = inject(Router);

  if (Capacitor.isNativePlatform()) {
    router.navigate(['/tabs/home']);
    return false;
  }

  return true;
};
