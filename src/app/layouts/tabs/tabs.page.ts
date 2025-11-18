import { Component, EnvironmentInjector, inject, signal } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
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
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [
    IonRouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  currenTab = signal<string>('home');

  getCurrentTab(event: { tab: string }) {
    this.currenTab.set(event.tab);
  }

  constructor() {
    addIcons({
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
    });
  }
}
