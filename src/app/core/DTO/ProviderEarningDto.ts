export interface ProviderEarningDto {
  bookingId: number;
  offerName: string;
  totalAmount: number;
  commissionAmount: number;
  gatewayFee: number;
  providerPayout: number;
  bookingStatus: string;
  payoutStatus: string;
  completedAt: string;
  settledAt: string;
}
