import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  IonButton,
  IonIcon,
  IonImg,
  IonInput,
} from '@ionic/angular/standalone';
import { Category } from 'src/app/core/models/CategoryModel';
import { CategoryService } from 'src/app/core/services/category.service';
import { addIcons } from 'ionicons';
import { optionsOutline, searchOutline } from 'ionicons/icons';
import { FiltermodalExploreComponent } from './components/filtermodal-explore/filtermodal-explore.component';
import { BookingFilters, Offer, OfferType } from 'src/app/core/models/Offers';
import { OfferService } from 'src/app/core/services/offers';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonIcon,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    CommonModule,
    FormsModule,
  ],
})
export class ExplorePage implements OnInit {
  categories: Category[] = [];
  offers: Offer[] = [];

  searchTerm = '';
  selectedCategoryName?: string;
  selectedOfferType: OfferType | 'ALL' = OfferType.ACCOMMODATION;

  advancedFilters: BookingFilters = {
    minPrice: 0,
    maxPrice: undefined,
    adults: 1,
    children: 0,
    pets: false,
    childrenAllowed: false,
    petsAllowed: false,
  };

  offerTypes = [
    { label: 'Alojamientos', value: OfferType.ACCOMMODATION },
    { label: 'Eventos', value: OfferType.EVENT },
    { label: 'Servicios', value: OfferType.SERVICE },
    { label: 'Productos', value: OfferType.PRODUCT },
  ];

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private categoryService: CategoryService,
    private offerService: OfferService,
    private navService: NavigationService,
  ) {
    addIcons({ optionsOutline, searchOutline });
  }

  async ngOnInit() {
    this.categories = await firstValueFrom(this.categoryService.getAll());
    this.preselectCategory();
    await this.fetchOffers();
  }

  get categoriesByType(): Category[] {
    if (this.selectedOfferType === 'ALL') return [];
    return this.categories.filter(
      (c) => c.type.toUpperCase() === this.selectedOfferType.toUpperCase(),
    );
  }

  private preselectCategory() {
    const typeCats = this.categoriesByType;
    this.selectedCategoryName =
      typeCats.length > 0 ? typeCats[0].name : undefined;
  }

  async onSearchInput() {
    await this.fetchOffers();
  }

  private async fetchOffers() {
    const hasSearch = !!this.searchTerm?.trim();
    const filters: any = { page: 0, size: 20 };

    if (hasSearch) {
      filters.name = this.searchTerm.trim();
    }
    if (this.selectedOfferType !== 'ALL') {
      filters.type = this.selectedOfferType;
    }
    if (this.selectedCategoryName && this.selectedOfferType !== 'ALL') {
      filters.category = this.selectedCategoryName;
    }

    if (
      this.advancedFilters.minPrice !== undefined &&
      this.advancedFilters.minPrice > 0
    ) {
      filters.minPrice = this.advancedFilters.minPrice;
    }
    if (
      this.advancedFilters.maxPrice !== null &&
      this.advancedFilters.maxPrice !== undefined &&
      this.advancedFilters.maxPrice > 0
    ) {
      filters.maxPrice = this.advancedFilters.maxPrice;
    }

    if (this.selectedOfferType === OfferType.ACCOMMODATION) {
      const guests =
        (this.advancedFilters.adults || 0) +
        (this.advancedFilters.children || 0);
      if (guests > 1) filters.maxGuests = guests;
      if (this.advancedFilters.petsAllowed) filters.allowPets = true;
      if (this.advancedFilters.childrenAllowed) filters.allowChildren = true;
    }

    if (
      this.selectedOfferType === OfferType.SERVICE &&
      this.advancedFilters.serviceCategory
    ) {
      filters.category = this.advancedFilters.serviceCategory;
    }

    if (this.advancedFilters.startDate) {
      filters.startDate = this.advancedFilters.startDate;
    }
    if (this.advancedFilters.endDate) {
      filters.endDate = this.advancedFilters.endDate;
    }

    if (
      !hasSearch &&
      this.selectedOfferType === 'ALL' &&
      Object.keys(filters).length <= 2
    ) {
      this.offers = [];
      return;
    }

    const res = await firstValueFrom(this.offerService.search(filters));
    this.offers = (res.content ?? []).map((item: any) => ({
      ...item,
      type: this.selectedOfferType as OfferType,
      images: item.images?.map((img: any) => img.imageUrl) ?? [],
      basePrice: item.baseprice ?? item.basePrice,
    }));
  }

  async selectOfferType(type: any) {
    this.selectedOfferType = this.selectedOfferType === type ? 'ALL' : type;
    if (this.selectedOfferType === 'ALL') {
      this.offers = [];
      this.selectedCategoryName = undefined;
    } else {
      this.preselectCategory();
      await this.fetchOffers();
    }
  }

  goToDetail(offerId: string) {
    this.navService.setReturnUrl('/tabs/offers');
    this.router.navigate(['/tabs/offers', offerId]);
  }

  async openFilters() {
    const modal = await this.modalCtrl.create({
      component: FiltermodalExploreComponent,
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9,
      componentProps: {
        initialFilters: {
          ...this.advancedFilters,
          offerType: this.selectedOfferType,
        },
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.advancedFilters = data;
      if (data.offerType && data.offerType !== this.selectedOfferType) {
        this.selectedOfferType = data.offerType;
        this.preselectCategory();
      }
      await this.fetchOffers();
    }
  }

  async selectCategory(categoryName: string) {
    this.selectedCategoryName =
      this.selectedCategoryName === categoryName ? undefined : categoryName;
    await this.fetchOffers();
  }

  get filteredOffers(): Offer[] {
    if (!this.searchTerm) return this.offers;
    return this.offers.filter((o) =>
      o.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
}
