import { Component, OnInit } from '@angular/core';
import { IonContent, IonRouterOutlet, IonApp } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonContent],
})
export class AuthLayoutComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
