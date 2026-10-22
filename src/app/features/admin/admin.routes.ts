import { Routes } from '@angular/router';
import { roleGuard } from '../auth/login/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'prices',
    pathMatch: 'full',
  },
  {
    path: 'prices',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    loadComponent: () =>
      import('./prices/admin-prices.page').then((m) => m.AdminPricesPage),
  },

  {
    path: 'users',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./users/admin-users.page').then((m) => m.AdminUsersPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./users/user-detail/admin-user-detail.page').then(
            (m) => m.AdminUserDetailPage,
          ),
      },
    ],
  },

  {
    path: 'providers',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./providers/admin-providers.page').then((m) => m.AdminProvidersPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./providers/provider-detail/admin-provider-detail.page').then(
            (m) => m.AdminProviderDetailPage,
          ),
      },
    ],
  },

  // TODO T6: habilitar gestión de festividades
  // {
  //   path: 'festivities',
  //   children: [
  //     {
  //       path: '',
  //       loadComponent: () =>
  //         import('./festivities/admin-festivities.page').then(
  //           (m) => m.AdminFestivitiesPage,
  //         ),
  //     },
  //     {
  //       path: ':id',
  //       loadComponent: () =>
  //         import('./festivities/festivity-editor/admin-festivity-editor.page').then(
  //           (m) => m.AdminFestivityEditorPage,
  //         ),
  //     },
  //   ],
  // },
];
