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
          import('../../features/turista/home/home.page').then((m) => m.HomePage),
      },

      /* ================== DESTINATIONS ================= */
      {
        path: 'offers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/turista/explore/explore.page').then(
                (m) => m.ExplorePage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../../features/turista/explore/pages/offer-details/offer-details.page').then(
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
              import('../../features/turista/events/events.page').then(
                (m) => m.EventsPage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../../features/turista/events/components/event-details/event-details.page').then(
                (m) => m.EventDetailsPage,
              ),
          },
          {
            path: 'festivity/:id',
            loadComponent: () =>
              import('../../features/turista/events/components/festivity-details/festivity-details.page').then(
                (m) => m.FestivityDetailsPage,
              ),
          },
        ],
      },

      /* ===================== DESTINOS ==================== */
      {
        path: 'destinations',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/turista/destinations/destinations.page').then(
                (m) => m.DestinationsPage,
              ),
          },
        ],
      },
      { path: 'map', redirectTo: 'destinations', pathMatch: 'full' },

      /* ===================== PRICES ==================== */
      {
        path: 'prices',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/turista/prices/prices.page').then(
                (m) => m.PricesPage,
              ),
          },
          {
            path: 'city/:cityId',
            loadComponent: () =>
              import('../../features/turista/prices/price-list/price-list.page').then(
                (m) => m.PriceListPage,
              ),
          },
        ],
      },

      /* =============== MANAGE OFFERS (PROVEEDOR) ============ */
      {
        path: 'manage-offers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/provider/manage-offers/manage-offers.page').then(
                (m) => m.ManageOffersPage,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('../../features/provider/manage-offers/offer-editor/offer-editor.page').then(
                (m) => m.OfferEditorPage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../../features/provider/manage-offers/offer-view/offer-view.page').then(
                (m) => m.OfferViewPage,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('../../features/provider/manage-offers/offer-editor/offer-editor.page').then(
                (m) => m.OfferEditorPage,
              ),
          },
        ],
      },

      /* =============== ADMIN PRICES ============ */
      {
        path: 'admin',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/admin/prices/admin-prices.page').then(
                (m) => m.AdminPricesPage,
              ),
          },
        ],
      },

      /* =============== PROVIDER SALES (PROVEEDOR) ============ */
      {
        path: 'provider-sales',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../../features/provider/sales/provider-sales.page').then(
                (m) => m.ProviderSalesPage,
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
              import('../../features/turista/account/account.page').then(
                (m) => m.AccountPage,
              ),
          },
          {
            path: 'edit',
            loadComponent: () =>
              import('../../features/turista/account/pages/edit/edit.page').then(
                (m) => m.EditPage,
              ),
          },
          {
            path: 'favorites',
            loadComponent: () =>
              import('../../features/turista/account/pages/favorites/favorites.page').then(
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
                  import('../../features/turista/account/pages/reservations/reservations.page').then(
                    (m) => m.ReservationsPage,
                  ),
              },
              {
                path: 'detail/:id',
                loadComponent: () =>
                  import('../../features/turista/account/pages/reservations/pages/reservation-detail/reservation-detail.page').then(
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
