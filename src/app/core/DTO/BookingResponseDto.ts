export interface BookingResponseDto {
  id: number;
  offerId: string;
  offerName: string;
  status: string;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  quantity: number;
  guestCount?: number;
  expiresAt: string;
  createdAt: string;
}
