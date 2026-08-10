export interface SettlementBookingDto {
  id: number;
  bookingId: number;
  providerPayout: number;
  commissionAmount: number;
  gatewayFee: number;
}

export interface ProviderSettlementDto {
  id: number;
  providerId: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  totalCommission: number;
  totalGatewayFee: number;
  netAmount: number;
  status: 'PENDING' | 'PAID';
  paidAt: string;
  createdAt: string;
  bookings?: SettlementBookingDto[];
}
