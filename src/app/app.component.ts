import { Component } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
// import { addIcons } from 'ionicons';
// import { moon, sunny } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonApp,
    IonRouterOutlet,
    IonButton,
  ],
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
