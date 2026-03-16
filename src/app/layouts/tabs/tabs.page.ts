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
  mapSharp,
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

  getCurrentTab(event: any) {
    this.currenTab.set(event.tab);
  }

  handleTabClick(tab: string) {
    if (this.currenTab() === tab) {
      this.navCtrl.navigateRoot(`/tabs/${tab}`);
    }
  }

  constructor() {
    addIcons({
      heart,
      heartOutline,
      homeOutline,
      mapSharp,
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
