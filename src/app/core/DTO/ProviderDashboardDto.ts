export interface ProviderOfferSummaryDto {
  offerId: string;
  name: string;
  type: string;
  category: string | null;
  baseprice: number;
  active: boolean;
  featured: boolean;
  currentStock: number | null;
  totalBookings: number;
  completedBookings: number;
  revenue: number;
}

export interface ProviderDashboardDto {
  totalRevenue: number;
  totalPaid: number;
  availableForPayout: number;
  nextPayoutDate: string;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalBookings: number;
  activeOffers: number;
  inactiveOffers: number;
  totalOffers: number;
  offers: ProviderOfferSummaryDto[];
  offersByType: Record<string, number>;
  lowStockOffers: number;
  upcomingBookings: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  averageRating: number;
  ratingCount: number;
  onboardingCompleted: boolean;
}
