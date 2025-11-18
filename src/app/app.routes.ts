import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { welcomeGuard } from './shared/guards/welcome.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./layouts/welcome/welcome.page').then((r) => r.WelcomePage),
    canMatch: [welcomeGuard],
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./layouts/tabs/tabs.routes').then((r) => r.routes),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.route').then((r) => r.authRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
