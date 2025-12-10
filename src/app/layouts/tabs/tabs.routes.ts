import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

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
        path: 'events/:id',
        loadComponent: () =>
          import(
            '../../features/events/components/event-details/event-details.page'
          ).then((m) => m.EventDetailsPage),
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
