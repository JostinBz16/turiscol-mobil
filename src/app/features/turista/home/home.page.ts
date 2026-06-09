import { Component, OnInit, inject } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notifications,
  searchOutline,
  alertCircleOutline,
  sparklesOutline,
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
    ProviderDashboardComponent,
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
  role = this.authStore.role;

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
    });
  }

  offers: Offer[] = [];

  ngOnInit() {
    if (this.role() !== 'proveedor') {
      this.loadData();
    }
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

  getDepartmentName(departmentId?: string): string {
    return departmentId ? (this.departmentMap.get(departmentId) ?? '') : '';
  }

  isFavorite(offer: Offer): boolean {
    return this.favoriteService.isFavorite(offer.id);
  }

  async toggleFavorite(offer: Offer) {
    await this.favoriteService.toggleFavorite(offer.id);
  }
}
