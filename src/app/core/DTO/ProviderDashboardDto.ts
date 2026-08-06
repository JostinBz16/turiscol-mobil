export interface ProviderDashboardDto {
  totalRevenue: number;
  totalPaid: number;
  availableForPayout: number;
  nextPayoutDate: string;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalBookings: number;
}
