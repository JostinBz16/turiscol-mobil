import { BookingResponseDto } from './BookingResponseDto';

export interface PaymentResponseDto {
  id: number;
  status: string;
  amount: number;
  currency: string;
  paidAt: string;
  createdAt: string;
}

export interface BookingStatusHistoryDto {
  status: string;
  changedAt: string;
}

export interface BookingDetailResponseDto extends BookingResponseDto {
  payments: PaymentResponseDto[];
  statusHistory: BookingStatusHistoryDto[];
}
