import { AccommodationDetailDto } from '../DTO/AccommodationDetailDto';
import { EventDetailDto } from '../DTO/EventDetailDto';
import { ProductDetailDto } from '../DTO/ProductDetailDto';
import { ServiceDetailDto } from '../DTO/ServiceDetailDto';
import {
  AccommodationCategory,
  AccommodationOffer,
  EventCategory,
  EventOffer,
  OfferType,
  ProductCategory,
  ProductOffer,
  ServiceOffer,
  ServiceCategory,
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
      name: dto.name,
      description: dto.description,
      images: (dto.images || []).map((i) => i.imageUrl),
      cityId: dto.cityId,
      providerId: dto.providerId,
      basePrice: dto.baseprice,
      active: dto.active,
      maxGuests: dto.maxGuests,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      allowPets: dto.allowPets,
      allowChildren: dto.allowChildren,
      pricePerNight: dto.pricePerNight,
      accommodationCategory: dto.accommodationCategory as AccommodationCategory,
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
      name: dto.name,
      description: dto.description,
      images: (dto.images || []).map((i) => i.imageUrl),
      cityId: dto.cityId,
      providerId: dto.providerId,
      basePrice: dto.baseprice,
      active: dto.active,
      eventDate: dto.startDate,
      endDate: dto.endDate,
      capacity: dto.maximumCapacity,
      ticketPrice: dto.ticketPrice,
      eventType: dto.eventType as EventCategory,
    };
  }
}

export class ProductOfferAdapter implements OfferDetailAdapter<
  ProductDetailDto,
  ProductOffer
> {
  adapt(dto: ProductDetailDto): ProductOffer {
    return {
      id: dto.id,
      type: OfferType.PRODUCT,
      name: dto.name,
      description: dto.description,
      images: (dto.images || []).map((i) => i.imageUrl),
      cityId: dto.cityId,
      providerId: dto.providerId,
      basePrice: dto.baseprice,
      active: dto.active,
      productCategory: dto.productCategory as ProductCategory,
      stock: dto.currentStock ?? 0,
    };
  }
}

export class ServiceOfferAdapter implements OfferDetailAdapter<
  ServiceDetailDto,
  ServiceOffer
> {
  adapt(dto: ServiceDetailDto): ServiceOffer {
    return {
      id: dto.id,
      type: OfferType.SERVICE,
      name: dto.name,
      description: dto.description,
      images: (dto.images || []).map((i) => i.imageUrl),
      cityId: dto.cityId,
      providerId: dto.providerId,
      basePrice: dto.baseprice,
      active: dto.active,
      serviceCategory: dto.serviceCategory as ServiceCategory,
      requiresSchedule: dto.requiresSchedule,
      durationInMinutes: dto.durationInMinutes,
      capacity: dto.capacity,
      pricePerPerson: dto.pricePerPerson,
    };
  }
}
