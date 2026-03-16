export enum OfferType {
  ACCOMMODATION = 'ACCOMMODATION',
  EVENT = 'EVENT',
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
}

export enum ServiceCategory {
  HOSPEDAJE = 'HOSPEDAJE',
  PASADIA = 'PASADIA',
  GASTRONOMIA = 'GASTRONOMIA',
  TOUR = 'TOUR',
  ARTESANIA = 'ARTESANIA',
  TRANSPORTE = 'TRANSPORTE',
  GUIA = 'GUIA',
  SERVICIO_TECNICO = 'SERVICIO_TECNICO',
}

export interface Offer {
  id: string;
  type: OfferType;
  title: string;
  description: string;
  categoryId: number;
  images: string[];
  cityId: number;
  rating: number;
  providerId: number;
  basePrice: number;
  active: boolean;
}

// --- alojamiento ---
export interface Rules {
  allowChildren: boolean;
  allowPets: boolean;
  pricing: {
    adult: number;
    child: number;
    pet?: number;
  };
}

export interface AccommodationOffer extends Offer {
  maxGuests: number;
  guestRules: Rules;
}

export interface EventOffer extends Offer {
  eventDate: string;
  capacity: number;
  eventAcces: string;
  rules: Rules;
}

// --- productos ---

export interface ProductOffer extends Offer {
  stock: number;
}

export interface ServiceOffer extends Offer {
  rules: Rules;
}

export interface BookingFilters {
  searchTerm?: string;
  offerType?: OfferType | 'ALL';
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
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
