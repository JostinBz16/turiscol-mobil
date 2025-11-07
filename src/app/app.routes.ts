import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

const showWelcomeGuard = () => {
  const shown = localStorage.getItem('welcomeShown');
  const router = inject(Router);
  if (shown) {
    router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }
  return true;
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./pages/welcome/welcome.page').then((m) => m.WelcomePage),
    canActivate: [showWelcomeGuard],
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
