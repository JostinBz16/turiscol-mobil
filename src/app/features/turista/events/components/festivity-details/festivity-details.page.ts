import { Component, OnInit, inject } from '@angular/core';
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
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';

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
    ChatFabComponent,
  ],
})
export class FestivityDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private festivityService = inject(FestivityService);

  festivity: Festivity | null = null;
  loading = true;
  error = false;

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
