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
        path: 'offers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/explore/explore.page').then(
                (m) => m.ExplorePage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../../features/explore/pages/offer-details/offer-details.page').then(
                (m) => m.OfferDetailsPage,
              ),
          },
        ],
      },

      /* ===================== EVENTS ==================== */
      {
        path: 'events',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/events/events.page').then(
                (m) => m.EventsPage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../../features/events/components/event-details/event-details.page').then(
                (m) => m.EventDetailsPage,
              ),
          },
        ],
      },

      /* ===================== PRICES ==================== */
      {
        path: 'prices',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/prices/prices.page').then(
                (m) => m.PricesPage,
              ),
          },
          {
            path: 'city/:cityId',
            loadComponent: () =>
              import('../../features/prices/price-list/price-list.page').then(
                (m) => m.PriceListPage,
              ),
          },
        ],
      },

      /* ===================== ACCOUNT =================== */
      {
        path: 'account',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/account/account.page').then(
                (m) => m.AccountPage,
              ),
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('../../features/account/pages/edit/edit.page').then(
                (m) => m.EditPage,
              ),
          },
          {
            path: 'favorites',
            loadComponent: () =>
              import('../../features/account/pages/favorites/favorites.page').then(
                (m) => m.FavoritesPage,
              ),
          },
          /* -------------- RESERVATIONS ---------------- */
          {
            path: 'reservations',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('../../features/account/pages/reservations/reservations.page').then(
                    (m) => m.ReservationsPage,
                  ),
              },
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import('../../features/account/pages/reservations/pages/reservation-detail/reservation-detail.page').then(
                    (m) => m.ReservationDetailPage,
                  ),
              },
            ],
          },
        ],
      },
    ],
  },
];
