import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.scss'],
  imports: [IonCardContent, IonCard],
})
export class PriceListComponent implements OnInit {
  @Input() items: any[] = [];
  constructor() {}

  ngOnInit() {}
}
