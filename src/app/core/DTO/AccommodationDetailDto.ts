export interface AccommodationDetailDto {
  id: string;
  name: string;
  description: string;
  providerId: string;
  baseprice: number;
  cityId: number;
  active: boolean;
  images: { imageUrl: string; publicId?: string; isPrimary?: boolean }[];
  type: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  allowPets: boolean;
  allowChildren: boolean;
  pricePerNight: number;
  accommodationCategory: string;
}
