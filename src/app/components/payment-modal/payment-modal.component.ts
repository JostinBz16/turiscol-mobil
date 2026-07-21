import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  imports: [
    CommonModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSpinner,
    IonIcon,
  ],
})
export class PaymentModalComponent {
  @Input() bookingId!: number;
  @Input() amount = 0;
  @Input() currency = 'COP';
  @Input() isOpen = false;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();

  private paymentService = inject(PaymentService);

  processing = signal(false);
  errorMessage = signal<string | null>(null);

  onWillDismiss() {
    this.errorMessage.set(null);
    this.isOpenChange.emit(false);
  }

  pay() {
    this.processing.set(true);
    this.errorMessage.set(null);

    this.paymentService.checkout(this.bookingId).subscribe({
      next: (checkout) => {
        this.processing.set(false);
        window.open(checkout.checkoutUrl, '_blank');
        this.paymentSuccess.emit({
          checkoutUrl: checkout.checkoutUrl,
          bookingId: this.bookingId,
          amount: checkout.amount,
          currency: checkout.currency,
        });
        this.close();
      },
      error: (err) => {
        this.processing.set(false);
        this.errorMessage.set('Error al procesar el pago. Intenta de nuevo.');
        this.paymentError.emit(err);
      },
    });
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
