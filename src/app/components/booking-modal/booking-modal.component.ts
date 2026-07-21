import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonInput,
  IonDatetime,
  IonSpinner,
  IonText,
  IonIcon,
  IonPopover,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { BookingService } from 'src/app/core/services/booking';
import { Booking } from 'src/app/core/models/Reservations';
import { OfferType } from 'src/app/core/models/Offers';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  templateUrl: './booking-modal.component.html',
  styleUrls: ['./booking-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonInput,
    IonDatetime,
    IonSpinner,
    IonText,
    IonIcon,
    IonPopover,
  ],
})
export class BookingModalComponent implements OnInit {
  @Input() offer: any = null;
  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() bookingCreated = new EventEmitter<Booking>();
  @Output() bookingReady = new EventEmitter<Booking>();

  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);

  form!: FormGroup;
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  today = '';

  showDatePicker = signal(false);
  activeDateField = signal<'startDate' | 'endDate'>('startDate');
  tempDate = signal('');
  popoverEvent = signal<Event | null>(null);

  constructor() {
    addIcons({ calendarOutline });
  }

  ngOnInit() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];

    this.form = this.fb.group({
      startDate: [this.isProduct() ? now.toISOString() : '', Validators.required],
      endDate: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      guests: [1, [Validators.required, Validators.min(1), Validators.max(this.maxGuests)]],
    });
  }

  get maxGuests(): number {
    return this.offer?.maxGuests ?? 20;
  }

  get nights(): number {
    if (!this.isAccommodation()) return 0;
    const start = this.form?.get('startDate')?.value;
    const end = this.form?.get('endDate')?.value;
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  get maxQuantity(): number {
    if (!this.offer) return 99;
    switch (this.offer.type) {
      case OfferType.ACCOMMODATION:
        return 99;
      case OfferType.EVENT:
        return this.offer.capacity ?? 99;
      case OfferType.SERVICE:
        return this.offer.capacity ?? 99;
      case OfferType.PRODUCT:
        return this.offer.stock ?? 99;
      default:
        return 99;
    }
  }

  get unitLabel(): string {
    if (!this.offer) return 'Unidades';
    switch (this.offer.type) {
      case OfferType.ACCOMMODATION:
        return 'Huéspedes';
      case OfferType.EVENT:
        return 'Entradas';
      case OfferType.SERVICE:
        return 'Personas';
      case OfferType.PRODUCT:
        return 'Unidades';
      default:
        return 'Unidades';
    }
  }

  get estimatedTotal(): number {
    if (!this.offer) return 0;
    if (this.isAccommodation()) {
      const n = this.nights;
      const price = this.offer.pricePerNight ?? this.offer.basePrice ?? 0;
      return n * price;
    }
    const qty = this.form?.get('quantity')?.value ?? 1;
    const price = this.offer.basePrice ?? this.offer.ticketPrice ?? this.offer.pricePerPerson ?? 0;
    return qty * price;
  }

  isAccommodation(): boolean {
    return this.offer?.type === OfferType.ACCOMMODATION;
  }

  isProduct(): boolean {
    return this.offer?.type === OfferType.PRODUCT;
  }

  modalTitle(): string {
    return this.isProduct() ? 'Comprar' : 'Reservar';
  }

  submitLabel(): string {
    return this.isProduct() ? 'Ir al pago' : 'Confirmar Reserva';
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return 'Seleccionar fecha';
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  openDatePicker(field: 'startDate' | 'endDate', event: Event) {
    this.activeDateField.set(field);
    this.popoverEvent.set(event);
    const currentValue = this.form.get(field)?.value;
    this.tempDate.set(currentValue || this.today);
    this.showDatePicker.set(true);
  }

  confirmDate() {
    const dateValue = this.tempDate();
    const dateOnly = dateValue.split('T')[0];
    this.form.get(this.activeDateField())?.setValue(dateOnly);
    this.showDatePicker.set(false);
  }

  cancelDatePicker() {
    this.showDatePicker.set(false);
  }

  onWillDismiss() {
    this.form?.reset({ quantity: 1, guests: 1 });
    this.errorMessage.set(null);
    this.submitting.set(false);
    this.isOpenChange.emit(false);
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }

  submit() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const { startDate, endDate, quantity, guests } = this.form.value;

    const payload = {
      offerId: this.offer.id,
      startDate: this.isProduct()
        ? new Date().toISOString()
        : startDate.split('T')[0],
      endDate: endDate ? endDate.split('T')[0] : undefined,
      quantity: this.isAccommodation() ? this.nights : quantity,
      guestCount: this.isAccommodation() ? guests : undefined,
    };

    this.bookingService.createBooking(payload).subscribe({
      next: (res: Booking) => {
        this.submitting.set(false);
        this.bookingCreated.emit(res);

        if (this.isProduct()) {
          this.bookingReady.emit(res);
        }

        this.close();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Error al crear la reserva. Intenta de nuevo.',
        );
      },
    });
  }
}
