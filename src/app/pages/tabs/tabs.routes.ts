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
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'destination',
        loadComponent: () =>
          import('../destination/destination.page').then(
            (m) => m.DestinationPage
          ),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('../bookings/bookings.page').then((m) => m.BookingsPage),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('../events/events.page').then((m) => m.EventsPage),
      },
      {
        path: 'prices',
        loadComponent: () =>
          import('../prices-list/prices-list.page').then(
            (m) => m.PricesListPage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../account/account.page').then((m) => m.AccountPage),
      },
    ],
  },
];
