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
import { offersMock } from 'src/app/core/data/ProductMock';
import {
  AccommodationOffer,
  BookingFilters,
  EventOffer,
  Offer,
  OfferType,
  ProductOffer,
  ServiceOffer,
  ServiceCategory,
} from 'src/app/core/models/Offers';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { firstValueFrom } from 'rxjs';

function getOfferCategory(offer: Offer): string | undefined {
  switch (offer.type) {
    case OfferType.ACCOMMODATION:
      return (offer as AccommodationOffer).accommodationCategory;
    case OfferType.SERVICE:
      return (offer as ServiceOffer).serviceCategory;
    case OfferType.PRODUCT:
      return (offer as ProductOffer).productCategory;
    case OfferType.EVENT:
      return (offer as EventOffer).eventType;
  }
}

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
  offers: Offer[] = offersMock;

  searchTerm = '';
  selectedCategoryName?: string;
  selectedOfferType: OfferType | 'ALL' = 'ALL';

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
    private navService: NavigationService,
  ) {
    addIcons({ optionsOutline, searchOutline });
  }

  async ngOnInit() {
    this.categories = await firstValueFrom(this.categoryService.getAll());
  }

  selectOfferType(type: any) {
    this.selectedOfferType = this.selectedOfferType === type ? 'ALL' : type;
    this.selectedCategoryName = undefined;
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
      if (data.offerType) {
        this.selectedOfferType = data.offerType;
      }
    }
  }

  selectCategory(categoryName: string) {
    this.selectedCategoryName =
      this.selectedCategoryName === categoryName ? undefined : categoryName;
  }

  get filteredOffers(): Offer[] {
    return this.offers.filter((o) => {
      const matchesSearch = o.name
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchesType =
        this.selectedOfferType === 'ALL' || o.type === this.selectedOfferType;

      const offerCat = getOfferCategory(o);
      const matchesCategory =
        !this.selectedCategoryName ||
        offerCat === this.selectedCategoryName;

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
      } else if (
        this.selectedOfferType === OfferType.SERVICE
      ) {
        const item = o as ServiceOffer;
        if (
          this.advancedFilters.serviceCategory &&
          item.serviceCategory !== this.advancedFilters.serviceCategory
        ) {
          matchesContext = false;
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPrice &&
        matchesContext
      );
    });
  }
}
