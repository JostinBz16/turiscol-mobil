import { Injectable } from '@angular/core';
import { Category } from '../models/CategoryModel';
import { categories } from '../data/CategoryMock';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  getAll(): Category[] {
    return categories;
  }

  getById(id: string): Category | undefined {
    return categories.find((c) => c.id === id);
  }
}
