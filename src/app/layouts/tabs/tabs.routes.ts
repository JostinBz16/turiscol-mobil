import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: '/tabs/home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('../../features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'destination',
        loadComponent: () =>
          import('../../features/destination/destination.page').then(
            (m) => m.DestinationPage
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('../../features/events/events.page').then((m) => m.EventsPage),
      },
      {
        path: 'prices',
        loadComponent: () =>
          import('../../features/prices/prices.page').then((m) => m.PricesPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../../features/account/account.page').then(
            (m) => m.AccountPage
          ),
      },
    ],
  },
];
