import { CreateBookingRequestDto } from '../DTO/CreateBookingRequestDto';
import { BookingResponseDto } from '../DTO/BookingResponseDto';
import { BookingDetailResponseDto } from '../DTO/BookingDetailResponseDto';
import { UpdateBookingRequestDto } from '../DTO/UpdateBookingRequestDto';
import {
  Booking,
  BookingDetail,
  BookingStatus,
} from '../models/Reservations';

export function toBooking(dto: BookingResponseDto): Booking {
  return {
    id: dto.id,
    offerId: dto.offerId,
    status: dto.status as BookingStatus,
    totalAmount: dto.totalAmount,
    currency: dto.currency,
    startDate: dto.startDate,
    endDate: dto.endDate,
    quantity: dto.quantity,
    expiresAt: dto.expiresAt,
    createdAt: dto.createdAt,
  };
}

export function toBookingDetail(
  dto: BookingDetailResponseDto,
): BookingDetail {
  return {
    ...toBooking(dto),
    payments: (dto.payments ?? []).map((p) => ({
      id: p.id,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      createdAt: p.createdAt,
    })),
    statusHistory: (dto.statusHistory ?? []).map((h) => ({
      status: h.status,
      changedAt: h.changedAt,
    })),
  };
}

export function toCreateBookingRequestDto(payload: {
  offerId: string;
  startDate: string;
  endDate?: string;
  quantity: number;
  guestCount?: number;
}): CreateBookingRequestDto {
  return {
    offerId: payload.offerId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    quantity: payload.quantity,
    guestCount: payload.guestCount,
  };
}

export function toUpdateBookingRequestDto(payload: {
  startDate?: string;
  endDate?: string;
  quantity?: number;
  guestCount?: number;
  newStatus?: string;
}): UpdateBookingRequestDto {
  return {
    startDate: payload.startDate,
    endDate: payload.endDate,
    quantity: payload.quantity,
    guestCount: payload.guestCount,
    newStatus: payload.newStatus,
  };
}
