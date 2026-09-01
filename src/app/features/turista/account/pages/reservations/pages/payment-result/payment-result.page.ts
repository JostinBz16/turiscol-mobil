import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ChatFabComponent } from 'src/app/components/chat-fab/chat-fab.component';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  templateUrl: './payment-result.page.html',
  styleUrls: ['./payment-result.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonIcon,
    IonButton,
    ChatFabComponent,
  ],
})
export class PaymentResultPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  navService = inject(NavigationService);

  status = signal<'success' | 'failure' | 'pending'>('pending');
  bookingId = signal<number | null>(null);

  ngOnInit() {
    const status = this.route.snapshot.queryParamMap.get('status');
    const bookingId = this.route.snapshot.queryParamMap.get('bookingId');

    if (bookingId) {
      this.bookingId.set(Number(bookingId));
    }

    if (status === 'success' || status === 'approved') {
      this.status.set('success');
    } else if (status === 'failure' || status === 'rejected') {
      this.status.set('failure');
    } else {
      this.status.set('pending');
    }
  }

  goToReservation() {
    if (this.bookingId()) {
      this.router.navigate(['/tabs/account/reservations/detail', this.bookingId()]);
    } else {
      this.router.navigate(['/tabs/account/reservations']);
    }
  }

  goToHome() {
    this.router.navigate(['/tabs/home']);
  }
}
