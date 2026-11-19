import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * A session exists only while the token and the stored user are both present.
 * Logout removes them, so a stale page reached with the browser Back button
 * is detected here instead of rendering protected content.
 */
export function hasSession(): boolean {
  return (
    !!localStorage.getItem('access_token') && !!localStorage.getItem('user')
  );
}

/**
 * Requires an active session. Without one, redirects to the login page.
 * Usable as `canActivate` and `canActivateChild` (same signature).
 */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return hasSession() ? true : router.createUrlTree(['/auth/login']);
};
