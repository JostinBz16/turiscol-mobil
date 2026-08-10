import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface OfferImage {
  id: string;
  imageUrl: string;
  publicId?: string;
  isPrimary: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OfferImageService {
  private http = inject(HttpClient);

  private api(offerId: string): string {
    return `${environment.apiUrl}/offers/${offerId}/images`;
  }

  getImages(offerId: string): Observable<OfferImage[]> {
    return this.http.get<OfferImage[]>(this.api(offerId)).pipe(
      catchError((err) => {
        console.error('Error fetching offer images', err);
        return throwError(() => err);
      }),
    );
  }

  addByUrl(offerId: string, imageUrl: string, isPrimary = false): Observable<OfferImage> {
    return this.http.post<OfferImage>(this.api(offerId), { imageUrl, isPrimary }).pipe(
      catchError((err) => {
        console.error('Error adding image by URL', err);
        return throwError(() => err);
      }),
    );
  }

  upload(offerId: string, file: File, isPrimary = false): Observable<OfferImage> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));
    return this.http
      .post<OfferImage>(`${this.api(offerId)}/upload`, formData)
      .pipe(
        catchError((err) => {
          console.error('Error uploading image', err);
          return throwError(() => err);
        }),
      );
  }

  delete(offerId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.api(offerId)}/${imageId}`).pipe(
      catchError((err) => {
        console.error('Error deleting image', err);
        return throwError(() => err);
      }),
    );
  }

  setPrimary(offerId: string, imageId: string): Observable<void> {
    return this.http.patch<void>(`${this.api(offerId)}/${imageId}/primary`, {}).pipe(
      catchError((err) => {
        console.error('Error setting primary image', err);
        return throwError(() => err);
      }),
    );
  }
}
