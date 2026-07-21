export interface Booking {
  id: number;
  offerId: string;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  quantity: number;
  expiresAt?: string;
  createdAt: string;
}

export interface BookingDetail extends Booking {
  payments: PaymentResponse[];
  statusHistory: BookingStatusHistory[];
}

export interface PaymentResponse {
  id: number;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export interface BookingStatusHistory {
  status: string;
  changedAt: string;
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}
