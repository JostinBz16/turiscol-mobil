import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './features/auth/login/services/auth';

@Component({
  selector: 'app-root',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  isDarkMode = false;

  constructor(private authStore: AuthService) {
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
