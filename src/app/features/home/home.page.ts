import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonImg,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notifications, searchOutline } from 'ionicons/icons';
import { CategoryService } from 'src/app/core/services/category.service';
import { MunicipalityService } from 'src/app/core/services/municipality.service';
import { Category } from 'src/app/core/models/CategoryModel';
import { Municipality } from 'src/app/core/models/Municipality';
import { DepartmentService } from 'src/app/core/services/DepartmentService';
import { FavoritesService } from 'src/app/core/services/favorites.services';
import { Offer } from 'src/app/core/models/Offers';
import { offersMock } from 'src/app/core/data/ProductMock';
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
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonImg,
  ],
})
export class HomePage implements OnInit {
  categories: Category[] = [];
  destinations: Municipality[] = [];
  departmentMap = new Map<string, string>();

  constructor(
    private categoryService: CategoryService,
    private municipalityService: MunicipalityService,
    private departmentService: DepartmentService,
    private favoriteService: FavoritesService,
  ) {
    addIcons({ searchOutline, notifications });
  }

  offers: Offer[] = [];

  ngOnInit() {
    this.loadData();
    this.offers = offersMock.filter((o) => o.active);
  }

  private async loadData() {
    this.categories = await firstValueFrom(this.categoryService.getAll());

    const featured = await firstValueFrom(this.municipalityService.getFeatured());
    this.destinations = featured.content ?? featured;

    const depts = await firstValueFrom(this.departmentService.getAll());
    const list = depts.content ?? depts;
    list.forEach((dep: any) => {
      this.departmentMap.set(dep.id, dep.name);
    });
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
