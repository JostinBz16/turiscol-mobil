import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/**
 * Tipos documentados en api-documentation.md:2098 (DestinationController) para
 * `DestinationRequestDTO.destinationType`.
 */
export type DestinationType =
  | 'VIEWPOINT'
  | 'SPOT'
  | 'HISTORICAL_SITE'
  | 'MUSEUM'
  | 'PARK'
  | 'BEACH'
  | 'NATURAL_RESERVE';

/** api-documentation.md:1814-1832 (MunicipalityRequestDTO / MunicipalityResponseDTO). */
export interface MunicipalityRequest {
  name: string;
  imageUrl: string;
  departmentId: number;
  featured: boolean;
}

export interface MunicipalityResponse {
  id: number;
  name: string;
  imageUrl: string;
  featured: boolean;
  department: { id: number; name: string };
}

/** api-documentation.md:1999-2010 (DepartmentRequestDTO / DepartmentResponseDTO). */
export interface DepartmentRequest {
  name: string;
}

export interface DepartmentResponse {
  id: number;
  name: string;
}

/**
 * api-documentation.md:2262-2280 (ImageDestinationController). Los endpoints de
 * creación por URL / PUT / DELETE son JSON simples y siguen el mismo patrón que el
 * resto del archivo. Los endpoints de subida de archivo (`/upload/...` y
 * `/batch-upload/...`, api-documentation.md:2302-2334, multipart) quedan
 * explícitamente FUERA de alcance de esta tarea (T10): requieren manejo de
 * `FormData`/`MultipartFile` que excede un CRUD simple — ver TODO en
 * `uploadDestinationImage`/`batchUploadDestinationImages` más abajo.
 */
export interface ImageDestinationDto {
  id?: number;
  url: string;
  publicId: string;
  destinationId?: number;
}

/** api-documentation.md:2106-2131 (DestinationRequestDTO / DestinationResponseDTO). */
export interface DestinationRequest {
  name: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  destinationType: DestinationType;
  municipalityId: number;
  active: boolean;
  featured: boolean;
  images?: ImageDestinationDto[];
}

export interface DestinationResponse {
  id: number;
  name: string;
  description: string;
  municipality: MunicipalityResponse;
  latitude: number;
  longitude: number;
  active: boolean;
  featured: boolean;
  imageUrls: string[];
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private http = inject(HttpClient);

  private readonly citiesApi = `${environment.apiUrl}/locations/cities`;
  private readonly departmentsApi = `${environment.apiUrl}/locations/departments`;
  private readonly destinationsApi = `${environment.apiUrl}/locations/destinations`;
  private readonly imagesApi = `${environment.apiUrl}/locations/images`;

  // ---------------------------------------------------------------------
  // CityController (Municipality) — api-documentation.md:1794-1982
  // ---------------------------------------------------------------------

  getCities(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.citiesApi, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching cities', err);
        return throwError(() => err);
      }),
    );
  }

  getCityById(id: string | number): Observable<MunicipalityResponse> {
    return this.http.get<MunicipalityResponse>(`${this.citiesApi}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching city', err);
        return throwError(() => err);
      }),
    );
  }

  createCity(dto: MunicipalityRequest): Observable<MunicipalityResponse> {
    return this.http.post<MunicipalityResponse>(this.citiesApi, dto).pipe(
      catchError((err) => {
        console.error('Error creating city', err);
        return throwError(() => err);
      }),
    );
  }

  updateCity(id: string | number, dto: MunicipalityRequest): Observable<MunicipalityResponse> {
    return this.http.put<MunicipalityResponse>(`${this.citiesApi}/${id}`, dto).pipe(
      catchError((err) => {
        console.error('Error updating city', err);
        return throwError(() => err);
      }),
    );
  }

  deleteCity(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.citiesApi}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting city', err);
        return throwError(() => err);
      }),
    );
  }

  // ---------------------------------------------------------------------
  // DepartmentController — api-documentation.md:1984-2080
  // ---------------------------------------------------------------------

  getDepartments(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.departmentsApi, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching departments', err);
        return throwError(() => err);
      }),
    );
  }

  getDepartmentById(id: string | number): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.departmentsApi}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching department', err);
        return throwError(() => err);
      }),
    );
  }

  createDepartment(dto: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(this.departmentsApi, dto).pipe(
      catchError((err) => {
        console.error('Error creating department', err);
        return throwError(() => err);
      }),
    );
  }

  updateDepartment(
    id: string | number,
    dto: DepartmentRequest,
  ): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.departmentsApi}/${id}`, dto).pipe(
      catchError((err) => {
        console.error('Error updating department', err);
        return throwError(() => err);
      }),
    );
  }

  deleteDepartment(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.departmentsApi}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting department', err);
        return throwError(() => err);
      }),
    );
  }

  // ---------------------------------------------------------------------
  // DestinationController — api-documentation.md:2083-2246
  // ---------------------------------------------------------------------

  getDestinations(params?: { page?: number; size?: number }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http.get<any>(this.destinationsApi, { params: httpParams }).pipe(
      catchError((err) => {
        console.error('Error fetching destinations', err);
        return throwError(() => err);
      }),
    );
  }

  /**
   * `GET /locations/destinations/by-city/{cityId}` (api-documentation.md:962).
   * The doc does not state whether this endpoint is paginated, so callers must
   * accept either a Page or a plain array.
   */
  getDestinationsByCity(
    cityId: string | number,
    params?: { page?: number; size?: number },
  ): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.size) httpParams = httpParams.set('size', params.size);
    return this.http
      .get<any>(`${this.destinationsApi}/by-city/${cityId}`, { params: httpParams })
      .pipe(
        catchError((err) => {
          console.error('Error fetching destinations by city', err);
          return throwError(() => err);
        }),
      );
  }

  getDestinationById(id: string | number): Observable<DestinationResponse> {
    return this.http.get<DestinationResponse>(`${this.destinationsApi}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching destination', err);
        return throwError(() => err);
      }),
    );
  }

  createDestination(dto: DestinationRequest): Observable<DestinationResponse> {
    return this.http.post<DestinationResponse>(this.destinationsApi, dto).pipe(
      catchError((err) => {
        console.error('Error creating destination', err);
        return throwError(() => err);
      }),
    );
  }

  updateDestination(
    id: string | number,
    dto: DestinationRequest,
  ): Observable<DestinationResponse> {
    return this.http.put<DestinationResponse>(`${this.destinationsApi}/${id}`, dto).pipe(
      catchError((err) => {
        console.error('Error updating destination', err);
        return throwError(() => err);
      }),
    );
  }

  deleteDestination(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.destinationsApi}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting destination', err);
        return throwError(() => err);
      }),
    );
  }

  // ---------------------------------------------------------------------
  // ImageDestinationController — api-documentation.md:2249-2362
  //
  // Solo se cubren los endpoints JSON simples (listar / crear por URL /
  // actualizar / eliminar). Los endpoints de subida de archivo quedan como
  // TODO explícito: requieren construir `FormData` y un flujo de UI de carga
  // de archivos que excede el alcance de un CRUD de datos maestros (T10). Si
  // se necesita subida real de imágenes para destinos, implementar
  // `uploadDestinationImage`/`batchUploadDestinationImages` como métodos
  // nuevos usando `FormData` antes de exponerlos en la UI.
  // ---------------------------------------------------------------------

  getDestinationImages(destinationId: string | number): Observable<ImageDestinationDto[]> {
    return this.http
      .get<ImageDestinationDto[]>(`${this.imagesApi}/by-destination/${destinationId}`)
      .pipe(
        catchError((err) => {
          console.error('Error fetching destination images', err);
          return throwError(() => err);
        }),
      );
  }

  addDestinationImageByUrl(
    destinationId: string | number,
    dto: Pick<ImageDestinationDto, 'url' | 'publicId'>,
  ): Observable<ImageDestinationDto> {
    return this.http
      .post<ImageDestinationDto>(`${this.imagesApi}/by-destination/${destinationId}`, dto)
      .pipe(
        catchError((err) => {
          console.error('Error creating destination image', err);
          return throwError(() => err);
        }),
      );
  }

  updateDestinationImage(
    imageId: string | number,
    dto: Pick<ImageDestinationDto, 'url' | 'publicId'>,
  ): Observable<ImageDestinationDto> {
    return this.http.put<ImageDestinationDto>(`${this.imagesApi}/${imageId}`, dto).pipe(
      catchError((err) => {
        console.error('Error updating destination image', err);
        return throwError(() => err);
      }),
    );
  }

  deleteDestinationImage(imageId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.imagesApi}/${imageId}`).pipe(
      catchError((err) => {
        console.error('Error deleting destination image', err);
        return throwError(() => err);
      }),
    );
  }

  // TODO (fuera de alcance T10): `uploadDestinationImage` (POST multipart
  // `/locations/images/upload/by-destination/{destinationId}`, campo `file`,
  // api-documentation.md:2302-2317) y `batchUploadDestinationImages` (POST
  // multipart `/locations/images/batch-upload/by-destination/{destinationId}`,
  // campo `files[]`, api-documentation.md:2320-2334) no están implementados:
  // requieren `FormData` y un componente de carga de archivos, no un simple
  // CRUD JSON. Confirmar con el usuario si se necesitan antes de agregarlos.
}
