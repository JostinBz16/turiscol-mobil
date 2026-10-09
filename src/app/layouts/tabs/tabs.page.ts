import { Component, EnvironmentInjector, inject, signal } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  mapOutline,
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
  map,
  gridOutline,
  grid,
  calendarOutline,
  calendar,
  globe,
  globeOutline,
  location,
  locationOutline,
  storefrontOutline,
  storefront
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
  private navCtrl = inject(NavController);

  private readonly providerTabs = new Set(['manage-offers', 'provider-sales']);

  getCurrentTab(event: any) {
    this.currenTab.set(event.tab);
  }

  onTabButtonClick(event: Event) {
    const detail = (event as CustomEvent<{ tab?: string }>).detail;
    const tab = detail?.tab;
    if (!tab) return;

    if (this.providerTabs.has(tab)) {
      event.stopPropagation();
      this.currenTab.set(tab);
      this.navCtrl.navigateRoot(`/tabs/${tab}`);
      return;
    }

    if (this.currenTab() === tab) {
      event.stopPropagation();
      this.navCtrl.navigateRoot(`/tabs/${tab}`);
    }
  }

  goToProfile() {
    this.navCtrl.navigateRoot('/tabs/account');
  }

  constructor() {
    addIcons({
      heart,
      heartOutline,
      homeOutline,
      mapOutline,
      briefcase,
      person,
      home,
      map,
      receipt,
      personOutline,
      receiptOutline,
      colorPalette,
      colorPaletteOutline,
      cash,
      cashOutline,
      gridOutline,
      grid,
      storefrontOutline,
      storefront,
      calendarOutline,
      calendar,
      globe,
      globeOutline,
      location,
      locationOutline,
    });
  }
}
