export interface CreateBookingRequestDto {
  offerId: string;
  startDate: string;
  endDate?: string;
  quantity: number;
  guestCount?: number;
}
