export interface EventDetailDto {
  id: string;
  name: string;
  description: string;
  providerId: string;
  baseprice: number;
  cityId: number;
  active: boolean;
  images: { imageUrl: string; publicId?: string; isPrimary?: boolean }[];
  type: string;
  startDate: string;
  endDate: string;
  maximumCapacity: number;
  ticketPrice: number;
  purchaseUrl?: string;
  eventType: string;
}
