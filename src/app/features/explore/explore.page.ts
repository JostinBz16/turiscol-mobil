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
import { Offer } from 'src/app/core/models/Offers';
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

  goToDetail(offerId: string) {
    this.navService.setReturnUrl('/tabs/offers');
    this.router.navigate(['/tabs/offers', offerId]);
  }

  async openFilters() {
    const modal = await this.modalCtrl.create({
      component: FiltermodalExploreComponent,
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9,
    });
    await modal.present();
  }

  selectCategory(categoryId: number) {
    this.selectedCategory =
      this.selectedCategory === categoryId ? undefined : categoryId;
  }

  get filteredOffers(): Offer[] {
    return this.offers.filter(
      (o) =>
        (!this.selectedCategory || o.categoryId === this.selectedCategory) &&
        o.title.toLowerCase().includes(this.searchTerm.toLowerCase()),
    );
  }
}
