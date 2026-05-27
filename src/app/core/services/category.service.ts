import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category } from '../models/CategoryModel';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly api = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Record<string, string[]>>(this.api).pipe(
      map((response) => {
        const result: Category[] = [];
        for (const [type, names] of Object.entries(response)) {
          names.forEach((name) => result.push({ type, name }));
        }
        return result;
      }),
    );
  }
}
