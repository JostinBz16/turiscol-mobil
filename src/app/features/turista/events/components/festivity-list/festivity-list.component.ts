import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonCard,
  IonCardContent,
  IonAccordion,
  IonImg,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Festivity } from 'src/app/core/models/Festivity';

@Component({
  selector: 'app-festivity-list',
  standalone: true,
  imports: [RouterLink, IonImg, CommonModule, IonCard, IonCardContent, IonAccordion],
  templateUrl: './festivity-list.component.html',
  styleUrls: ['./festivity-list.component.scss'],
})
export class FestivityListComponent {
  @Input() festivities: Festivity[] = [];

  getImage(f: Festivity): string {
    if ((f as any).images?.length) return (f as any).images[0];
    return f.image || '';
  }
}
