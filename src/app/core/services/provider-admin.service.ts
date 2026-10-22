import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserService } from './User';
import { UserApi } from '../models/User';

/**
 * Provider as surfaced by the admin "users by role" / "user by id" endpoints.
 *
 * `UserApi` only documents the base `UserResponseDTO` fields
 * (api-documentation.md:194-203). `onboardingCompleted` is documented on
 * `ProviderResponseDTO` (api-documentation.md:205-219), returned by provider
 * registration/update and `GET /user/providers/by-username/{username}` — NOT
 * confirmed to be present on `GET /users/{id}` or `GET /users/role/{role}`,
 * which is what this service actually calls (see TODO below). The field is
 * kept optional here and the UI must treat it as "unknown" rather than
 * "false" when absent.
 */
export interface ProviderApi extends UserApi {
  onboardingCompleted?: boolean;
}

/**
 * Admin-facing provider operations, built entirely on top of `UserService`.
 *
 * This service intentionally does NOT make its own HTTP calls: there is no
 * dedicated "list/get provider as admin" endpoint in the backend
 * (api-documentation.md:346-389, `ProviderController`). The only existing
 * provider endpoints are `POST /user/providers` and
 * `PUT /user/providers/{id}` (both explicitly marked "interno, sin
 * Gateway" — not meant for this admin panel) and
 * `GET /user/providers/by-username/{username}`. So listing/fetching
 * providers for admin purposes goes through the generic `UserController`
 * endpoints via `UserService.getByRole('PROVIDER')` / `getById`.
 *
 * TODO(backend): There is NO endpoint, in the current `api-documentation.md`,
 * for differentiated provider "approval" distinct from the generic
 * user activate/deactivate toggle. `onboardingCompleted` is marked as set
 * automatically once a provider finishes their banking data (see
 * `ProviderResponseDTO`), not by any admin action. Until backend confirms
 * otherwise, `approve`/`suspend` below are literally aliases for
 * `UserService.activate`/`deactivate` — i.e. "approving" a provider in this
 * panel only (re)activates their generic user account, it does not perform
 * any provider-specific business validation. Confirm with the backend team
 * whether a dedicated `PENDING_APPROVAL` status or a differentiated
 * provider-approval endpoint is needed before treating this as a real
 * business approval flow.
 */
@Injectable({
  providedIn: 'root',
})
export class ProviderAdminService {
  private userService = inject(UserService);

  listProviders(params?: { page?: number; size?: number }): Observable<any> {
    return this.userService.getByRole('PROVIDER', params);
  }

  getById(id: string): Observable<ProviderApi> {
    return this.userService.getById(id).pipe(map((user) => user as ProviderApi));
  }

  /**
   * "Approves" a provider. See class-level TODO: this is literally
   * `UserService.activate`, there is no differentiated approval endpoint.
   */
  approve(id: string): Observable<void> {
    return this.userService.activate(id);
  }

  /**
   * "Suspends" a provider. See class-level TODO: this is literally
   * `UserService.deactivate`, there is no differentiated suspension endpoint.
   */
  suspend(id: string): Observable<void> {
    return this.userService.deactivate(id);
  }
}
