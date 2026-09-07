import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSkeletonText } from '@ionic/angular/standalone';

export type SkeletonVariant = 'home' | 'catalog' | 'details' | 'bookings' | 'booking' | 'profile' | 'receipt';

@Component({
  selector: 'app-screen-skeleton',
  standalone: true,
  imports: [CommonModule, IonSkeletonText],
  template: `<div
    class="screen-skeleton"
    [class]="'screen-skeleton ' + variant()"
    aria-label="Loading content"
    role="status"
  >
    <span class="sr-only">Loading content</span>
    <div class="skeleton-hero" *ngIf="variant() === 'details'"></div>
    <div class="skeleton-profile" *ngIf="variant() === 'profile'">
      <span></span>
      <div><ion-skeleton-text animated /><ion-skeleton-text animated /></div>
    </div>
    <div class="skeleton-lines" *ngIf="variant() !== 'catalog'">
      <ion-skeleton-text animated /><ion-skeleton-text animated /><ion-skeleton-text animated />
    </div>
    <div
      class="skeleton-cards"
      [class.list]="variant() === 'bookings' || variant() === 'booking' || variant() === 'receipt'"
    >
      <article *ngFor="let item of [1, 2, 3]">
        <ion-skeleton-text animated class="media" />
        <ion-skeleton-text animated /><ion-skeleton-text animated /><ion-skeleton-text animated />
      </article>
    </div>
  </div>`,
})
export class ScreenSkeletonComponent {
  variant = input<SkeletonVariant>('catalog');
}
