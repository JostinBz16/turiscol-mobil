export interface ServiceDetailDto {
  id: string;
  name: string;
  description: string;
  providerId: string;
  baseprice: number;
  cityId: number;
  active: boolean;
  images: { imageUrl: string; publicId?: string; isPrimary?: boolean }[];
  type: string;
  serviceCategory: string;
  requiresSchedule: boolean;
  durationInMinutes: number;
  capacity: number;
  pricePerPerson: number;
}
