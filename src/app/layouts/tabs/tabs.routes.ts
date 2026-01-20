import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      /* ===================== HOME ===================== */
      {
        path: 'home',
        loadComponent: () =>
          import('../../features/home/home.page').then((m) => m.HomePage),
      },

      /* ================== DESTINATIONS ================= */
      {
        path: 'destination',
        loadComponent: () =>
          import('../../features/destination/destination.page').then(
            (m) => m.DestinationPage
          ),
      },

      /* ===================== EVENTS ==================== */
      {
        path: 'events',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/events/events.page').then(
                (m) => m.EventsPage
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import(
                '../../features/events/components/event-details/event-details.page'
              ).then((m) => m.EventDetailsPage),
          },
        ],
      },

      /* ===================== PRICES ==================== */
      {
        path: 'prices',
        loadComponent: () =>
          import('../../features/prices/prices.page').then((m) => m.PricesPage),
      },
      {
        path: 'likes',
        loadComponent: () =>
          import('../../features/likes/likes.page').then((m) => m.LikesPage),
      },
      /* ===================== ACCOUNT =================== */
      {
        path: 'account',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/account/account.page').then(
                (m) => m.AccountPage
              ),
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('../../features/account/pages/edit/edit.page').then(
                (m) => m.EditPage
              ),
          },

          /* -------------- RESERVATIONS ---------------- */
          {
            path: 'reservations',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    '../../features/account/pages/reservations/reservations.page'
                  ).then((m) => m.ReservationsPage),
              },
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import(
                    '../../features/account/pages/reservations/pages/reservation-detail/reservation-detail.page'
                  ).then((m) => m.ReservationDetailPage),
              },
            ],
          },

          /* -------------- NOTIFICATIONS ---------------- */
          {
            path: 'notifications',
            loadComponent: () =>
              import(
                '../../features/account/pages/notifications/notifications.page'
              ).then((m) => m.NotificationsPage),
          },
        ],
      },
    ],
  },
];
