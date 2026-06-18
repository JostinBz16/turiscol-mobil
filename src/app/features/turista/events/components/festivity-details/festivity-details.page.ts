import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonImg,
} from '@ionic/angular/standalone';
import { FestivityService } from 'src/app/core/services/festivity.service';
import { Festivity } from 'src/app/core/models/Festivity';

@Component({
  selector: 'app-festivity-details',
  templateUrl: './festivity-details.page.html',
  styleUrls: ['./festivity-details.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
})
export class FestivityDetailsPage implements OnInit {
  festivity: Festivity | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private festivityService: FestivityService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFestivity(id);
    }
  }

  private loadFestivity(id: string) {
    this.loading = true;
    this.error = false;

    this.festivityService.getById(id).subscribe({
      next: (res) => {
        this.festivity = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }
}
