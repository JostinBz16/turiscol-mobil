import { Injectable } from '@angular/core';
import { Product } from '../models/Product';
import { products } from '../data/ProductMock';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products$ = new BehaviorSubject<Product[]>(products);

  getAll() {
    return this.products$.asObservable();
  }

  getById(id: string) {
    return this.products$.value.find((p) => p.id === id);
  }

  getByCity(cityId: string) {
    return this.products$.value.filter((p) => p.cityId === cityId);
  }
}
