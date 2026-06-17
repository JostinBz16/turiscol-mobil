import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonImg,
  IonSpinner,
  IonChip,
  IonLabel,
  IonButtons,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notifications,
  searchOutline,
  alertCircleOutline,
  sparklesOutline,
  person,
  locationOutline,
  bedOutline,
  calendarOutline,
  constructOutline,
  cubeOutline,
} from 'ionicons/icons';
import { CategoryService } from 'src/app/core/services/category.service';
import { AuthService } from '../../auth/login/services/auth';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { Category } from 'src/app/core/models/CategoryModel';
import { Municipality } from 'src/app/core/models/Municipality';
import { DepartmentService } from 'src/app/core/services/DepartmentService';
import { FavoritesService } from 'src/app/core/services/favorites.services';
import { Offer } from 'src/app/core/models/Offers';
import { OfferService } from 'src/app/core/services/offers';
import { ProviderDashboardComponent } from '../../provider/dashboard/provider-dashboard.component';
import { SelectedCityService } from 'src/app/core/services/selected-city.service';
import { CitySelectorBarComponent } from 'src/app/components/city-selector-bar/city-selector-bar.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonImg,
    IonSpinner,
    IonChip,
    IonLabel,
    IonButtons,
    ProviderDashboardComponent,
    CitySelectorBarComponent,
  ],
})
export class HomePage implements OnInit {
  categories: Category[] = [];
  destinations: Municipality[] = [];
  departmentMap = new Map<string, string>();
  loading = false;
  error = false;
  errorMessage = '';

  private authStore = inject(AuthService);
  private selectedCityService = inject(SelectedCityService);
  private navCtrl = inject(NavController);
  role = this.authStore.role;
  selectedCity = this.selectedCityService.city;

  culturalFacts = [
    'Colombia tiene más de 4.000 especies de orquídeas.',
    'El Carnaval de Barranquilla es Patrimonio de la Humanidad.',
    'Colombia es el segundo país más biodiverso del mundo.',
    'El río Caño Cristales es el "río de los 7 colores".',
    'La Guajira tiene el desierto más activo de América Latina.',
    'El Teatro Colón de Bogotá es uno de los más importantes de Sudamérica.',
    'San Andrés tiene un mar de 7 colores.',
    'El café colombiano es reconocido como uno de los mejores del mundo.',
    'La Catedral de Sal de Zipaquirá es única en el mundo.',
    'Colombia tiene 59 parques naturales nacionales.',
    'Cali es la capital mundial de la Salsa.',
    'El Castillo San Felipe es la fortaleza más grande de Sudamérica.',
    'Colombia es el segundo país más feliz del mundo según el Happy Planet Index.',
    'El cóndor de los Andes es el ave voladora más grande del mundo.',
    'Colombia tiene 1.900 especies de aves, más que cualquier otro país.',
  ];
  currentFactIndex = 0;

  offerTypes = [
    { label: 'Alojamiento', value: 'accommodation', icon: 'bed-outline' },
    { label: 'Eventos', value: 'event', icon: 'calendar-outline' },
    { label: 'Servicios', value: 'service', icon: 'construct-outline' },
    { label: 'Productos', value: 'product', icon: 'cube-outline' },
  ];

  offers: Offer[] = [];

  constructor(
    private categoryService: CategoryService,
    public authService: AuthService,
    private municipalityService: MunicipalityService,
    private departmentService: DepartmentService,
    private favoriteService: FavoritesService,
    private offerService: OfferService,
  ) {
    addIcons({
      alertCircleOutline,
      searchOutline,
      sparklesOutline,
      notifications,
      person,
      locationOutline,
      bedOutline,
      calendarOutline,
      constructOutline,
      cubeOutline,
    });
  }

  ngOnInit() {
    if (this.role() !== 'proveedor') {
      this.loadData();
    }

    setInterval(() => {
      this.currentFactIndex =
        (this.currentFactIndex + 1) % this.culturalFacts.length;
    }, 8000);
  }

  async loadData() {
    this.loading = true;
    this.error = false;
    this.errorMessage = '';

    try {
      this.categories = await firstValueFrom(this.categoryService.getAll());

      const featured = await firstValueFrom(
        this.municipalityService.getFeatured(),
      );
      this.destinations = featured.content ?? featured;

      const featuredOffers = await firstValueFrom(
        this.offerService.getFeatured(),
      );
      this.offers = (featuredOffers.content ?? []).map((item: any) => ({
        ...item,
        images: item.images?.map((img: any) => img.imageUrl) ?? [],
        basePrice: item.baseprice ?? item.basePrice,
      }));

      const depts = await firstValueFrom(this.departmentService.getAll());
      const list = depts.content ?? depts;
      list.forEach((dep: any) => {
        this.departmentMap.set(dep.id, dep.name);
      });
    } catch (e) {
      this.error = true;
      this.errorMessage = 'Error al cargar la página de inicio';
    } finally {
      this.loading = false;
    }
  }

  selectCity(city: Municipality) {
    this.selectedCityService.select(city);
  }

  getDepartmentName(departmentId?: string): string {
    return departmentId ? (this.departmentMap.get(departmentId) ?? '') : '';
  }

  isFavorite(offer: Offer): boolean {
    return this.favoriteService.isFavorite(offer.id);
  }

  async toggleFavorite(offer: Offer) {
    await this.favoriteService.toggleFavorite(offer.id);
  }

  goToProfile() {
    this.navCtrl.navigateRoot('/tabs/account');
  }
}
