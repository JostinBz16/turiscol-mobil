import { Booking } from '../models/Reservations';

export const bookings: Booking[] = [
  {
    id: 'bkg-01',
    userId: 'usr-01',
    targetId: 'srv-01',
    type: 'service',
    date: '2025-02-15',
    status: 'confirmed',
  },
  {
    id: 'bkg-02',
    userId: 'usr-04',
    targetId: 'evt-02',
    type: 'event',
    date: '2025-03-10',
    status: 'pending',
  },
  {
    id: 'bkg-03',
    userId: 'usr-05',
    targetId: 'prd-02',
    type: 'product',
    quantity: 2,
    date: '2025-01-30',
    status: 'confirmed',
  },
  {
    id: 'bkg-04',
    userId: 'usr-02',
    targetId: 'srv-05',
    type: 'service',
    date: '2025-04-01',
    status: 'pending',
  },
  {
    id: 'bkg-05',
    userId: 'usr-06',
    targetId: 'prd-05',
    type: 'product',
    quantity: 1,
    date: '2025-02-20',
    status: 'cancelled',
  },
  {
    id: 'bkg-06',
    userId: 'usr-03',
    targetId: 'evt-04',
    type: 'event',
    date: '2025-11-12',
    status: 'confirmed',
  },
];
