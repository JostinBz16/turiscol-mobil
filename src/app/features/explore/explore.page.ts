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
import { BookingFilters, Offer, OfferType, ServiceCategory } from 'src/app/core/models/Offers';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';

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
  selectedCategory?: number;
  selectedOfferType: OfferType | 'ALL' = 'ALL';

  advancedFilters: BookingFilters = {
    minPrice: 0,
    maxPrice: 2000000,
    minRating: 0,
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

  ngOnInit() {
    this.categories = this.categoryService.getAll();
  }

  selectOfferType(type: any) {
    this.selectedOfferType = this.selectedOfferType === type ? 'ALL' : type;
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

  selectCategory(categoryId: number) {
    this.selectedCategory =
      this.selectedCategory === categoryId ? undefined : categoryId;
  }

  get filteredOffers(): Offer[] {
    return this.offers.filter((o) => {
      // 1. Basic Search & Category
      const matchesSearch = o.title
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        !this.selectedCategory || o.categoryId === this.selectedCategory;

      // 2. Offer Type
      const matchesType =
        this.selectedOfferType === 'ALL' || o.type === this.selectedOfferType;

      // 3. Advanced Filters (Price & Rating)
      const matchesPrice =
        o.basePrice >= (this.advancedFilters.minPrice || 0) &&
        o.basePrice <= (this.advancedFilters.maxPrice || 2000000);
      const matchesRating = o.rating >= (this.advancedFilters.minRating || 0);

      // 4. Contextual Filters (Placeholder logic for mock data)
      // In a real app, these would be part of the backend query
      let matchesContext = true;
      if (this.selectedOfferType === OfferType.ACCOMMODATION) {
        // Example check: maxGuests from AccommodationOffer
        const acc = o as any;
        if (acc.maxGuests && this.advancedFilters.adults) {
          matchesContext =
            acc.maxGuests >=
            this.advancedFilters.adults + (this.advancedFilters.children || 0);
        }
      } else if (this.selectedOfferType === OfferType.EVENT || this.selectedOfferType === OfferType.SERVICE) {
        // Event/Service: Check "Allowed" rules
        const item = o as any;
        if (this.advancedFilters.childrenAllowed && item.rules && !item.rules.allowChildren) {
          matchesContext = false;
        }
        if (this.advancedFilters.petsAllowed && item.rules && !item.rules.allowPets) {
          matchesContext = false;
        }

        // Service specific: Category check
        if (this.selectedOfferType === OfferType.SERVICE && this.advancedFilters.serviceCategory) {
          // Note: Assuming ServiceOffer has a category or subtype field matching ServiceCategory
          // In this mock, we might need to check a custom property or description for demo
          if (item.serviceCategory !== this.advancedFilters.serviceCategory) {
            matchesContext = false;
          }
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesPrice &&
        matchesRating &&
        matchesContext
      );
    });
  }
}
