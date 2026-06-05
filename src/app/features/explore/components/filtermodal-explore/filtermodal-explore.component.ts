import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonList,
  IonLabel,
  IonDatetime,
  IonToggle,
  ModalController,
  IonAccordion,
  IonAccordionGroup,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, star } from 'ionicons/icons';
import {
  BookingFilters,
  OfferType,
  ServiceCategory,
} from 'src/app/core/models/Offers';

@Component({
  selector: 'app-filtermodal-explore',
  templateUrl: './filtermodal-explore.component.html',
  styleUrls: ['./filtermodal-explore.component.scss'],
  standalone: true,
  imports: [
    IonFooter,
    CommonModule,
    FormsModule,
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonContent,
    IonList,
    IonLabel,
    IonDatetime,
    IonToggle,
  ],
})
export class FiltermodalExploreComponent implements OnInit {
  @Input() initialFilters!: BookingFilters;
  filters: BookingFilters = {
    minPrice: 0,
    maxPrice: undefined,
    adults: 1,
    children: 0,
    pets: false,
    childrenAllowed: false,
    petsAllowed: false,
  };

  offerTypeEnum = OfferType;
  serviceCategoryEnum = ServiceCategory;
  serviceCategories = Object.values(ServiceCategory);

  constructor(private modalCtrl: ModalController) {
    addIcons({ closeOutline, star });
  }

  ngOnInit() {
    if (this.initialFilters) {
      this.filters = { ...this.filters, ...this.initialFilters };
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  apply() {
    this.modalCtrl.dismiss(this.filters);
  }

  reset() {
    this.filters = {
      minPrice: 0,
      maxPrice: 0,
      offerType: this.filters.offerType,
      adults: 1,
      children: 0,
      pets: false,
      childrenAllowed: false,
      petsAllowed: false,
      serviceCategory: undefined,
    };
  }
}
