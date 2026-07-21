export interface UpdateBookingRequestDto {
  startDate?: string;
  endDate?: string;
  quantity?: number;
  guestCount?: number;
  newStatus?: string;
}
