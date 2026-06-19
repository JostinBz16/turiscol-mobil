import {
  Component,
  inject,
  signal,
  effect,
  untracked,
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';
import { Router } from '@angular/router';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';
import { MapDisplayComponent } from 'src/app/components/map-display/map-display.component';
import { Destination } from 'src/app/core/models/Destination';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    CitySelectorBarComponent,
    MapDisplayComponent,
  ],
})
export class MapPage {
  private router = inject(Router);

  private municipalityService = inject(MunicipalityService);
  private selectedCityService = inject(SelectedCityService);

  city = this.selectedCityService.city;
  loading = signal(false);
  destinations = signal<Destination[]>([]);
  allDestinations: Destination[] = [];

  constructor() {
    addIcons({ person });

    effect(() => {
      const currentCity = this.city();
      if (currentCity) {
        untracked(() => this.loadDestinations());
      } else {
        this.allDestinations = [];
        this.destinations.set([]);
      }
    });
  }

  loadDestinations() {
    const currentCity = this.city();
    if (!currentCity) return;

    this.loading.set(true);
    this.municipalityService.getDestinationsByCity(currentCity.id).subscribe({
      next: (res: any) => {
        const list: Destination[] = res.content || res || [];
        this.allDestinations = list;
        this.destinations.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  goToProfile() {
    localStorage.setItem('account_return_url', '/tabs/map');
    this.router.navigate(['/tabs/account']);
  }
}
