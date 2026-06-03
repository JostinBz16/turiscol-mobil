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
} from '@ionic/angular/standalone';
import { Category } from 'src/app/core/models/CategoryModel';
import { CategoryService } from 'src/app/core/services/category.service';
import { addIcons } from 'ionicons';
import { optionsOutline, searchOutline } from 'ionicons/icons';
import { FiltermodalExploreComponent } from './components/filtermodal-explore/filtermodal-explore.component';
import {
  AccommodationOffer,
  BookingFilters,
  Offer,
  OfferType,
  ServiceOffer,
} from 'src/app/core/models/Offers';
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
    maxPrice: 2000000,
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
    this.selectedCategoryName = typeCats.length > 0 ? typeCats[0].name : undefined;
  }

  private async fetchOffers() {
    if (this.selectedOfferType === 'ALL' || !this.selectedCategoryName) {
      this.offers = [];
      return;
    }
    const res = await firstValueFrom(
      this.offerService.findByTypeAndCategory(
        this.selectedOfferType as OfferType,
        this.selectedCategoryName,
        { page: 0, size: 20 },
      ),
    );
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
        await this.fetchOffers();
      }
    }
  }

  async selectCategory(categoryName: string) {
    this.selectedCategoryName =
      this.selectedCategoryName === categoryName ? undefined : categoryName;
    await this.fetchOffers();
  }

  get filteredOffers(): Offer[] {
    return this.offers.filter((o) => {
      const matchesSearch = o.name
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

      const matchesPrice =
        o.basePrice >= (this.advancedFilters.minPrice || 0) &&
        o.basePrice <= (this.advancedFilters.maxPrice || 2000000);

      let matchesContext = true;
      if (this.selectedOfferType === OfferType.ACCOMMODATION) {
        const acc = o as AccommodationOffer;
        if (acc.maxGuests && this.advancedFilters.adults) {
          matchesContext =
            acc.maxGuests >=
            this.advancedFilters.adults + (this.advancedFilters.children || 0);
        }
      } else if (this.selectedOfferType === OfferType.SERVICE) {
        const item = o as ServiceOffer;
        if (
          this.advancedFilters.serviceCategory &&
          item.serviceCategory !== this.advancedFilters.serviceCategory
        ) {
          matchesContext = false;
        }
      }

      return matchesSearch && matchesPrice && matchesContext;
    });
  }
}
