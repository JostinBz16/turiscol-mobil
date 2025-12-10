export interface Booking {
  id: string;
  userId: string;
  targetId: string; // service, product or event id
  type: 'service' | 'product' | 'event';
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  quantity?: number; // for products
}
