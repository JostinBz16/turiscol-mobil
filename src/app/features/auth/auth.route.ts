import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'remember-password',
    loadComponent: () =>
      import('./pages/remember-password/remember-password.page').then(
        (m) => m.RememberPasswordPage
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
];
