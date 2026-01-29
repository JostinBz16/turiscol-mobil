import { Booking, BookingStatus } from '../models/Reservations';

export const bookingsMock: Booking[] = [
  {
    id: 1,
    offerId: 'acc-1',
    status: BookingStatus.CONFIRMED,
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    guests: {
      adults: 2,
      children: 1,
      pets: 1,
    },
  },
  {
    id: 2,
    offerId: 'evt-1',
    status: BookingStatus.PENDING,
    startDate: '2026-06-20',
    guests: {
      adults: 2,
      children: 0,
      pets: 0,
    },
  },
  {
    id: 3,
    offerId: 'evt-2',
    status: BookingStatus.CONFIRMED,
    startDate: '2026-05-10',
    guests: {
      adults: 1,
      children: 2,
      pets: 0,
    },
  },
  {
    id: 4,
    offerId: 'prd-1',
    status: BookingStatus.CONFIRMED,
    quantity: 3,
  },
  {
    id: 5,
    offerId: 'srv-1',
    status: BookingStatus.CANCELED,
    startDate: '2026-04-02',
    guests: {
      adults: 4,
      children: 2,
      pets: 0,
    },
  },
];
