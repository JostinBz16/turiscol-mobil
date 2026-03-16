import { AccommodationDetailDto } from '../DTO/AccommodationDetailDto';
import { EventDetailDto } from '../DTO/EventDetailDto';
import { ProductDetailDto } from '../DTO/ProductDetailDto';
import {
  AccommodationOffer,
  EventOffer,
  OfferType,
  ProductOffer,
} from '../models/Offers';

export interface OfferDetailAdapter<DTO, DOMAIN> {
  adapt(dto: DTO): DOMAIN;
}

export class AccommodationOfferAdapter implements OfferDetailAdapter<
  AccommodationDetailDto,
  AccommodationOffer
> {
  adapt(dto: AccommodationDetailDto): AccommodationOffer {
    return {
      id: dto.id,
      type: OfferType.ACCOMMODATION,
      title: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      images: dto.imgs,
      cityId: dto.city_id,
      rating: dto.rating,
      providerId: dto.provider_id,
      basePrice: dto.price,
      active: dto.is_active,
      maxGuests: dto.max_guests,
      guestRules: {
        allowChildren: dto.rules.children,
        allowPets: dto.rules.pets,
        pricing: dto.rules.prices,
      },
    };
  }
}

export class EventOfferAdapter implements OfferDetailAdapter<
  EventDetailDto,
  EventOffer
> {
  adapt(dto: EventDetailDto): EventOffer {
    return {
      id: dto.id,
      type: OfferType.EVENT,
      title: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      images: dto.images,
      cityId: dto.city,
      rating: dto.score,
      providerId: dto.provider,
      basePrice: dto.base_price,
      active: dto.enabled,
      eventDate: dto.date,
      capacity: dto.capacity,
      eventAcces: dto.access,
      rules: dto.rules,
    };
  }
}

export class ProductOfferAdapter implements OfferDetailAdapter<
  ProductDetailDto,
  ProductOffer
> {
  adapt(dto: ProductDetailDto): ProductOffer {
    return {
      id: dto.uuid,
      type: OfferType.PRODUCT,
      title: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      images: dto.images,
      cityId: dto.cityId,
      rating: dto.rating,
      providerId: dto.providerId,
      basePrice: dto.price,
      active: dto.active,
      stock: dto.stock,
    };
  }
}
