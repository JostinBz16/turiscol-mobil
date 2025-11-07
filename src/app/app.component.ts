import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  isDarkMode = false;

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

  // constructor() {
  //   addIcons({
  //     moon,
  //     sunny,
  //   });
  // }
}
