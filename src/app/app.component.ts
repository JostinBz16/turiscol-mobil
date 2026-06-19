import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './features/auth/login/services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private authStore = inject(AuthService);

  isDarkMode = false;

  constructor() {
    this.authStore.loadFromStorage();
  }

  toggleTheme() {
    const body = document.documentElement;
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      body.classList.remove('light');
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
      body.classList.add('light');
    }
  }
}
