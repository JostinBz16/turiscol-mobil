import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProviderDashboardDto } from '../DTO/ProviderDashboardDto';
import { ProviderEarningDto } from '../DTO/ProviderEarningDto';
import { ProviderSettlementDto } from '../DTO/ProviderSettlementDto';

@Injectable({
  providedIn: 'root',
})
export class ProviderFinanceService {
  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/providers`;

  getDashboard(): Observable<ProviderDashboardDto> {
    return this.http.get<ProviderDashboardDto>(`${this.api}/dashboard`).pipe(
      catchError((err) => {
        console.error('Error fetching provider dashboard', err);
        return throwError(() => err);
      }),
    );
  }

  getEarnings(): Observable<ProviderEarningDto[]> {
    return this.http.get<ProviderEarningDto[]>(`${this.api}/earnings`).pipe(
      catchError((err) => {
        console.error('Error fetching provider earnings', err);
        return throwError(() => err);
      }),
    );
  }

  getSettlements(): Observable<ProviderSettlementDto[]> {
    return this.http.get<ProviderSettlementDto[]>(`${this.api}/settlements`).pipe(
      catchError((err) => {
        console.error('Error fetching provider settlements', err);
        return throwError(() => err);
      }),
    );
  }

  getSettlementById(id: number | string): Observable<ProviderSettlementDto> {
    return this.http.get<ProviderSettlementDto>(`${this.api}/settlements/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching settlement detail', err);
        return throwError(() => err);
      }),
    );
  }
}
