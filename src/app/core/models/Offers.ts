export enum OfferType {
  ACCOMMODATION = 'ACCOMMODATION',
  EVENT = 'EVENT',
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
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

export interface Favorite {
  id: string;
  userId: string;
  offerId: string;
  createdAt: string;
}
