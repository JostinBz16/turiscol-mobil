import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  inject,
  signal,
  NgZone,
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
export class PaymentModalComponent implements OnInit, OnDestroy {
  @Input() bookingId!: number;
  @Input() amount = 0;
  @Input() currency = 'COP';
  @Input() isOpen = false;

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();

  private paymentService = inject(PaymentService);
  private zone = inject(NgZone);

  loading = signal(true);
  processing = signal(false);
  errorMessage = signal<string | null>(null);
  brickReady = signal(false);

  async ngOnInit() {
    if (this.isOpen) {
      await this.initBrick();
    }
  }

  async ngOnDestroy() {
    this.paymentService.destroyBrick();
  }

  async onWillPresent() {
    await this.initBrick();
  }

  onWillDismiss() {
    this.paymentService.destroyBrick();
    this.brickReady.set(false);
    this.loading.set(true);
    this.errorMessage.set(null);
    this.isOpenChange.emit(false);
  }

  async initBrick() {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      await this.paymentService.loadSdk().toPromise();

      this.zone.runOutsideAngular(() => {
        this.paymentService.createBrick('mp-payment-brick', this.amount, this.currency, {
          onFormReady: () => {
            this.zone.run(() => {
              this.loading.set(false);
              this.brickReady.set(true);
            });
          },
          onSubmit: (form: any) => {
            this.zone.run(() => {
              this.processPayment(form);
            });
          },
          onError: (error: any) => {
            this.zone.run(() => {
              console.error('Brick error:', error);
              this.errorMessage.set('Error al cargar el formulario de pago. Intenta de nuevo.');
              this.loading.set(false);
            });
          },
        });
      });
    } catch (err) {
      this.errorMessage.set('Error al conectar con MercadoPago. Verifica tu conexión.');
      this.loading.set(false);
    }
  }

  private processPayment(form: any) {
    this.processing.set(true);
    this.errorMessage.set(null);

    this.paymentService.checkout(this.bookingId).subscribe({
      next: (checkout) => {
        const paymentData = {
          ...form,
          checkoutUrl: checkout.checkoutUrl,
          bookingId: this.bookingId,
          amount: checkout.amount,
          currency: checkout.currency,
        };

        this.processing.set(false);
        this.paymentSuccess.emit(paymentData);
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
