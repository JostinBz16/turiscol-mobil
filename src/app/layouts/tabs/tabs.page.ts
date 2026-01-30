import { Component, EnvironmentInjector, inject, signal } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  mapOutline,
  map,
  briefcase,
  home,
  receiptOutline,
  receipt,
  colorPalette,
  colorPaletteOutline,
  person,
  personOutline,
  heart,
  heartOutline,
  cash,
  cashOutline,
} from 'ionicons/icons';
import { AuthService } from 'src/app/features/auth/login/services/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  private authStore = inject(AuthService);

  role = this.authStore.role;

  currenTab = signal<string>('home');

  getCurrentTab(event: { tab: string }) {
    this.currenTab.set(event.tab);
  }

  constructor() {
    addIcons({
      heart,
      heartOutline,
      homeOutline,
      map,
      briefcase,
      person,
      home,
      receipt,
      personOutline,
      receiptOutline,
      mapOutline,
      colorPalette,
      colorPaletteOutline,
      cash,
      cashOutline,
    });
  }
}
