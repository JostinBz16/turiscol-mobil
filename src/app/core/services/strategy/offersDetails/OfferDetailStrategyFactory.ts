import { Injectable } from '@angular/core';
import { AccommodationDetailStrategy } from './AccommodationDetailStrategy';
import { EventDetailStrategy } from './EventDetailStrategy';
import { ProductDetailStrategy } from './ProductDetailStrategy';
import { ServiceDetailStrategy } from './ServiceDetailStrategy';
import { OfferType } from 'src/app/core/models/Offers';
import { OfferDetailStrategy } from './OfferDetailStrategy';

@Injectable({ providedIn: 'root' })
export class OfferDetailStrategyFactory {
  constructor(
    private accommodation: AccommodationDetailStrategy,
    private event: EventDetailStrategy,
    private product: ProductDetailStrategy,
    private service: ServiceDetailStrategy,
  ) {}

  getStrategy(type: OfferType): OfferDetailStrategy<any> {
    switch (type) {
      case OfferType.ACCOMMODATION:
        return this.accommodation;
      case OfferType.EVENT:
        return this.event;
      case OfferType.PRODUCT:
        return this.product;
      case OfferType.SERVICE:
        return this.service;
      default:
        throw new Error(`No strategy for offer type ${type}`);
    }
  }
}
