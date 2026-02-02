export interface Booking {
  id: number;
  offerId: string;
  status: BookingStatus;
  startDate: string;
  endDate?: string;
  guests?: GuestCount;
  quantity?: number;
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
}

export interface GuestCount {
  adults: number;
  children: number;
  pets: number;
}
