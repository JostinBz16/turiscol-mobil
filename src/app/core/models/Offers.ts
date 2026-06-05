export enum OfferType {
  ACCOMMODATION = 'accommodation',
  EVENT = 'event',
  SERVICE = 'service',
  PRODUCT = 'product',
}

export enum ServiceCategory {
  GASTRONOMIA = 'GASTRONOMIA',
  TOUR = 'TOUR',
  ARTESANIA = 'ARTESANIA',
  TRANSPORTE = 'TRANSPORTE',
  GUIA = 'GUIA',
  SERVICIO_TECNICO = 'SERVICIO_TECNICO',
}

export enum AccommodationCategory {
  HOSPEDAJE = 'HOSPEDAJE',
  PASADIA = 'PASADIA',
}

export enum ProductCategory {
  ARTESANIA = 'ARTESANIA',
  GASTRONOMIA = 'GASTRONOMIA',
  TEXTIL = 'TEXTIL',
  BEBIDA = 'BEBIDA',
  OTRO = 'OTRO',
}

export enum EventCategory {
  CONCERT = 'CONCERT',
  WORKSHOP = 'WORKSHOP',
  CONFERENCE = 'CONFERENCE',
  FESTIVAL = 'FESTIVAL',
  EXHIBITION = 'EXHIBITION',
  TOUR = 'TOUR',
  OTHER = 'OTHER',
}

export interface Offer {
  id: string;
  type: OfferType;
  name: string;
  description: string;
  images: string[];
  cityId: number;
  providerId: string;
  basePrice: number;
  active: boolean;
}

export interface AccommodationOffer extends Offer {
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  allowPets: boolean;
  allowChildren: boolean;
  pricePerNight: number;
  accommodationCategory: AccommodationCategory;
}

export interface EventOffer extends Offer {
  eventDate: string;
  endDate: string;
  capacity: number;
  ticketPrice: number;
  eventType: EventCategory;
}

export interface ProductOffer extends Offer {
  productCategory: ProductCategory;
  stock: number;
}

export interface ServiceOffer extends Offer {
  serviceCategory: ServiceCategory;
  requiresSchedule: boolean;
  durationInMinutes: number;
  capacity: number;
  pricePerPerson: number;
}

export interface BookingFilters {
  searchTerm?: string;
  offerType?: OfferType | 'ALL';
  categoryName?: string;
  minPrice?: number;
  maxPrice?: number | undefined;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  pets?: boolean;
  childrenAllowed?: boolean;
  petsAllowed?: boolean;
  serviceCategory?: ServiceCategory;
}

export interface Favorite {
  id: string;
  userId: string;
  offerId: string;
  createdAt: string;
}
