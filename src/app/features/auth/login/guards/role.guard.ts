import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard {
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = localStorage.getItem('role');
    return route.data['role'] === role;
  }
}
