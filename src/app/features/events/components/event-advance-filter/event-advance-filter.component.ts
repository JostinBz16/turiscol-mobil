import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashBinOutline } from 'ionicons/icons';
@Component({
  selector: 'app-event-advance-filter',
  templateUrl: './event-advance-filter.component.html',
  styleUrls: ['./event-advance-filter.component.scss'],
  imports: [
    IonIcon,
    CommonModule,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class EventAdvanceFilterComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    addIcons({
      trashBinOutline,
    });
  }

  @Output() dateFromChange = new EventEmitter<string | null>();
  @Output() dateToChange = new EventEmitter<string | null>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  @ViewChild('dateFromInput') dateFromInput!: any;
  @ViewChild('dateToInput') dateToInput!: any;
  @ViewChild('statusSelect') statusSelect!: any;

  onClear() {
    // 🔥 Limpia visualmente los inputs y el select
    if (this.dateFromInput) this.dateFromInput.nativeElement.value = '';
    if (this.dateToInput) this.dateToInput.nativeElement.value = '';
    if (this.statusSelect) this.statusSelect.value = 'todos';

    // 🔥 Propaga valores vacíos al padre
    this.dateFromChange.emit(null);
    this.dateToChange.emit(null);
    this.statusChange.emit('todos');

    // Notificar limpieza total
    this.clearFilters.emit();
  }

  onDateFrom(ev: any) {
    this.dateFromChange.emit(ev.target.value);
  }

  onDateTo(ev: any) {
    this.dateToChange.emit(ev.target.value);
  }

  onStatus(ev: any) {
    this.statusChange.emit(ev.target.value);
  }
}
