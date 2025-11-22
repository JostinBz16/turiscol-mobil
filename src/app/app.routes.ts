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
    loadComponent: () =>
      import('./layouts/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./layouts/tabs/tabs.routes').then((m) => m.routes),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.route').then((m) => m.authRoutes),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
