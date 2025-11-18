import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
} from '@ionic/angular/standalone';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-price-form',
  templateUrl: './price-form.component.html',
  styleUrls: ['./price-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonInput,
    IonItem,
    IonContent,
    IonButton,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
  ],
})
export class PriceFormComponent implements OnInit {
  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      service: ['', Validators.required],
      city: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(1)]],
    });
  }

  save() {
    if (this.form.invalid) return;

    this.onSave.emit(this.form.value);
  }

  close() {
    this.onClose.emit();
  }
}
