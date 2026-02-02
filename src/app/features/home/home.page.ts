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

  plans = [
    {
      title: 'Tour Islas del Rosario',
      description: 'Full day con transporte',
      price: 250000,
      image:
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/e9/fb/58/caption.jpg?w=1000&h=1000&s=1',
    },
    {
      title: 'City Tour Medellín',
      description: 'Recorrido por los principales atractivos',
      price: 150000,
      image: 'https://www.minuto30.com/wp-content/uploads/2020/01/medellin.jpg',
    },
  ];

  constructor(
    private categoryService: CategoryService,
    private municipalityService: MunicipalityService,
    private departmentService: DepartmentService,
  ) {
    addIcons({ searchOutline, notifications });
  }

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.categories = this.categoryService.getAll();
    this.destinations = this.municipalityService.getAll();

    this.departmentService.getAll().forEach((dep) => {
      this.departmentMap.set(dep.id, dep.name);
    });
  }

  getDepartmentName(departmentId?: string): string {
    return departmentId ? (this.departmentMap.get(departmentId) ?? '') : '';
  }
}
