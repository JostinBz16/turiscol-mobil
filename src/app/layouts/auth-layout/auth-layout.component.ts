import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, IonApp } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AuthLayoutComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
