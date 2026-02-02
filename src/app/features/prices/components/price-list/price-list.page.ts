import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.page.html',
  styleUrls: ['./price-list.page.scss'],
  imports: [IonCardContent, IonCard],
})
export class PriceListComponent implements OnInit {
  @Input() items: any[] = [];
  constructor() {}

  ngOnInit() {}
}
