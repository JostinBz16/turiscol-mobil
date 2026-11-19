import { Routes } from '@angular/router';
import { roleGuard } from '../auth/login/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    loadComponent: () =>
      import('./dashboard/admin-dashboard-overview.page').then(
        (m) => m.AdminDashboardOverviewPage,
      ),
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
    path: 'offers',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./offers/admin-offers.page').then((m) => m.AdminOffersPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./offers/offer-detail/admin-offer-detail.page').then(
            (m) => m.AdminOfferDetailPage,
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

  {
    path: 'festivities',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./festivities/admin-festivities.page').then(
            (m) => m.AdminFestivitiesPage,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./festivities/festivity-editor/admin-festivity-editor.page').then(
            (m) => m.AdminFestivityEditorPage,
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./festivities/festivity-editor/admin-festivity-editor.page').then(
            (m) => m.AdminFestivityEditorPage,
          ),
      },
    ],
  },

  {
    path: 'locations',
    canActivate: [roleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./locations/admin-locations.page').then(
            (m) => m.AdminLocationsPage,
          ),
      },
      {
        path: 'cities',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./locations/cities/admin-cities.page').then(
                (m) => m.AdminCitiesPage,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./locations/cities/city-editor/admin-city-editor.page').then(
                (m) => m.AdminCityEditorPage,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./locations/cities/city-editor/admin-city-editor.page').then(
                (m) => m.AdminCityEditorPage,
              ),
          },
        ],
      },
      {
        path: 'departments',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./locations/departments/admin-departments.page').then(
                (m) => m.AdminDepartmentsPage,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './locations/departments/department-editor/admin-department-editor.page'
              ).then((m) => m.AdminDepartmentEditorPage),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import(
                './locations/departments/department-editor/admin-department-editor.page'
              ).then((m) => m.AdminDepartmentEditorPage),
          },
        ],
      },
      {
        path: 'destinations',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./locations/destinations/admin-destinations.page').then(
                (m) => m.AdminDestinationsPage,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import(
                './locations/destinations/destination-editor/admin-destination-editor.page'
              ).then((m) => m.AdminDestinationEditorPage),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import(
                './locations/destinations/destination-editor/admin-destination-editor.page'
              ).then((m) => m.AdminDestinationEditorPage),
          },
        ],
      },
    ],
  },
];
