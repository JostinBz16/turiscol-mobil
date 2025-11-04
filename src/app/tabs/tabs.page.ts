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
  calendarOutline,
  briefcaseOutline,
  map,
  briefcase,
  calendar,
  home,
  cash,
  cashOutline,
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
      calendar,
      home,
      cash,
      cashOutline,
      mapOutline,
      calendarOutline,
      briefcaseOutline,
    });
  }
}
