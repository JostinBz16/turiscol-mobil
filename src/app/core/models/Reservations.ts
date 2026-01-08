export interface Booking {
  id: number;
  title: string;
  type: string;
  image: string;
  status: BookingStatus;
  startDate: string;
  endDate?: string;
  people: number;
  subtotal: number;
  taxes: number;
  total: number;
  quantity?: number; // for products
}

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
}
