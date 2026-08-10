import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface Review {
  id: string;
  offerId: string;
  authorId: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export interface RatingSummary {
  average: number;
  totalReviews: number;
}

export interface ReviewPage {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ReviewRequest {
  offerId: string;
  authorId: string;
  comment: string;
  rating: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/reviews`;

  getReviewsByOffer(offerId: string, page = 0, size = 20): Observable<ReviewPage> {
    return this.http
      .get<ReviewPage>(`${this.api}/offer/${offerId}`, { params: { page, size } })
      .pipe(
        catchError((err) => {
          console.error('Error fetching reviews', err);
          return throwError(() => err);
        }),
      );
  }

  getRatingSummary(offerId: string): Observable<RatingSummary> {
    return this.http
      .get<RatingSummary>(`${this.api}/service/${offerId}/summary`)
      .pipe(
        catchError((err) => {
          console.error('Error fetching rating summary', err);
          return throwError(() => err);
        }),
      );
  }

  getProviderRatingSummary(providerId: string): Observable<RatingSummary> {
    return this.http
      .get<RatingSummary>(`${this.api}/provider/${providerId}/summary`)
      .pipe(
        catchError((err) => {
          console.error('Error fetching provider rating summary', err);
          return throwError(() => err);
        }),
      );
  }

  createReview(request: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.api, request).pipe(
      catchError((err) => {
        console.error('Error creating review', err);
        return throwError(() => err);
      }),
    );
  }

  updateReview(id: string, request: ReviewRequest): Observable<Review> {
    return this.http.put<Review>(`${this.api}/${id}`, request).pipe(
      catchError((err) => {
        console.error('Error updating review', err);
        return throwError(() => err);
      }),
    );
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting review', err);
        return throwError(() => err);
      }),
    );
  }
}
