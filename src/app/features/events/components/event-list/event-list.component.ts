import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
})
export class EventListComponent {
  @Input() events: any[] = [];

  @Output() selectEvent = new EventEmitter<number>();

  openDetails(event: any) {
    console.log('CLICK EVENT:', event);
    this.selectEvent.emit(event.id);
  }
}
