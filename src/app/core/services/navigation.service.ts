import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private _returnUrl = signal<string>('/tabs/home');

  readonly returnUrl = this._returnUrl.asReadonly();

  setReturnUrl(url: string) {
    this._returnUrl.set(url);
  }
}
