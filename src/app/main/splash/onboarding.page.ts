import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { carSportOutline, calendarOutline, keyOutline } from 'ionicons/icons';
import { StorageService } from '../../core/storage.service';
@Component({
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  template: `<ion-content [fullscreen]="true"
    ><div class="onboarding">
      <button class="skip" (click)="finish()">Skip</button>
      <div class="onboarding-art"><ion-icon [name]="slides[index()].icon" /></div>
      <p class="eyebrow">{{ index() + 1 }} of 3</p>
      <h1>{{ slides[index()].title }}</h1>
      <p>{{ slides[index()].body }}</p>
      <div class="dots">
        <span *ngFor="let s of slides; let i = index" [class.active]="i === index()"></span>
      </div>
      <ion-button expand="block" size="large" (click)="next()">{{
        index() === 2 ? 'Start exploring' : 'Continue'
      }}</ion-button>
    </div></ion-content
  >`,
})
export class OnboardingPage {
  readonly index = signal(0);
  readonly slides = [
    {
      icon: 'car-sport-outline',
      title: 'Find your perfect ride',
      body: 'Browse trusted cars, vans, pickups, and scooters before you sign in.',
    },
    {
      icon: 'calendar-outline',
      title: 'Book in a few taps',
      body: 'Choose dates, see the full price, apply a voucher, and reserve with confidence.',
    },
    {
      icon: 'key-outline',
      title: 'Manage every journey',
      body: 'Track bookings, view receipts, and get support wherever the road takes you.',
    },
  ];
  constructor(
    private readonly router: Router,
    private readonly storage: StorageService,
  ) {
    addIcons({ carSportOutline, calendarOutline, keyOutline });
  }
  next(): void {
    if (this.index() === 2) this.finish();
    else this.index.update((v) => v + 1);
  }
  finish(): void {
    this.storage.set('pms.onboarding', true);
    void this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }
}
