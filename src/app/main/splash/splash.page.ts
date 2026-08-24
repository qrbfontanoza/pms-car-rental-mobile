import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { StorageService } from '../../core/storage.service';
@Component({
  standalone: true,
  imports: [IonContent, IonSpinner],
  template: `<ion-content [fullscreen]="true" class="splash"
    ><div>
      <img src="assets/logo.png" alt="PMS Car Rental" />
      <h1>PMS Car Rental</h1>
      <p>Your journey, your way.</p>
      <ion-spinner name="crescent" aria-label="Loading application" /></div
  ></ion-content>`,
})
export class SplashPage implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly storage: StorageService,
  ) {}
  ngOnInit(): void {
    setTimeout(
      () =>
        void this.router.navigateByUrl(
          this.storage.get('pms.onboarding', false) ? '/tabs/home' : '/onboarding',
          { replaceUrl: true },
        ),
      700,
    );
  }
}
