import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category } from '../models/CategoryModel';
import { environment } from 'src/environments/environment';
import { OfferType } from '../models/Offers';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly categoriesApi = `${environment.apiUrl}/offers/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Record<string, string[]>>(this.categoriesApi).pipe(
      map((response) => {
        const result: Category[] = [];
        for (const [type, names] of Object.entries(response)) {
          names.forEach((name) => result.push({ type, name }));
        }
        return result;
      }),
    );
  }

  getByType(type: OfferType | string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/offers/types/${type}/categories`);
  }
}
