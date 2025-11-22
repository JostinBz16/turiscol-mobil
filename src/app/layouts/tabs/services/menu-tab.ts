import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MenuTab {
  // constructor(private authService: AuthService) {}

  getMenuItems() {
    // const user = this.authService.getCurrentUser();
    const user: string = 'user';

    if (!user) return [];

    // switch (user.role) {
    switch (user) {
      case 'admin':
        return [
          { title: 'Inicio', path: '/tabs/home', icon: 'home' },
          { title: 'Eventos', path: '/tabs/events', icon: 'calendar' },
          { title: 'Usuarios', path: '/tabs/users', icon: 'people' },
        ];
      case 'provider':
        return [
          { title: 'Inicio', path: '/tabs/home', icon: 'home' },
          { title: 'Mis Reservas', path: '/tabs/bookings', icon: 'book' },
        ];
      default: // turista
        return [
          { title: 'Inicio', path: '/tabs/home', icon: 'home' },
          { title: 'Destinos', path: '/tabs/destinations', icon: 'map' },
          { title: 'Reservas', path: '/tabs/bookings', icon: 'calendar' },
          { title: 'Perfil', path: '/tabs/profile', icon: 'person' },
        ];
    }
  }
}
