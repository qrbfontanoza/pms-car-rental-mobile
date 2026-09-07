import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  banOutline,
  carSportOutline,
  checkmarkCircleOutline,
  hourglassOutline,
  peopleOutline,
  returnDownBackOutline,
  speedometerOutline,
  waterOutline,
} from 'ionicons/icons';
import { Booking, BookingPricePreview, BookingStatus, Vehicle } from '../models/domain.models';
import { peso } from '../utils/app.utils';
import { ImageFallbackDirective } from './image-fallback.directive';
@Component({
  selector: 'app-section-heading',
  standalone: true,
  template:
    '<div class="section-heading"><div><p>{{eyebrow()}}</p><h2>{{title()}}</h2></div><ng-content /></div>',
})
export class SectionHeadingComponent {
  title = input.required<string>();
  eyebrow = input('');
}
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [IonBadge, IonIcon],
  template:
    '<ion-badge [class]="status()" [attr.aria-label]="label"><ion-icon [name]="icon" aria-hidden="true" />{{label}}</ion-badge>',
})
export class StatusBadgeComponent {
  status = input.required<BookingStatus>();
  private readonly labels: Record<BookingStatus, string> = {
    pending: 'Awaiting confirmation',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    returned_early: 'Returned early',
  };
  private readonly icons: Record<BookingStatus, string> = {
    pending: 'hourglass-outline',
    confirmed: 'checkmark-circle-outline',
    completed: 'checkmark-circle-outline',
    cancelled: 'ban-outline',
    returned_early: 'return-down-back-outline',
  };
  constructor() {
    addIcons({ banOutline, checkmarkCircleOutline, hourglassOutline, returnDownBackOutline });
  }
  get label(): string {
    return this.labels[this.status()];
  }
  get icon(): string {
    return this.icons[this.status()];
  }
}
@Component({
  selector: 'app-price-breakdown',
  standalone: true,
  template: `<div class="price-breakdown">
    <div>
      <span
        >{{ preview().rentalDays }} day{{ preview().rentalDays === 1 ? '' : 's' }} ×
        {{ money(preview().dailyRate) }}</span
      ><strong>{{ money(preview().subtotal) }}</strong>
    </div>
    <div class="discount" *ngIf="preview().discount">
      <span>Voucher discount</span><strong>−{{ money(preview().discount) }}</strong>
    </div>
    <div class="total">
      <span>Total</span><strong>{{ money(preview().total) }}</strong>
    </div>
    <small>Payment: {{ paymentLabel }}</small>
  </div>`,
  imports: [CommonModule],
})
export class PriceBreakdownComponent {
  preview = input.required<BookingPricePreview>();
  paymentStatus = input<Booking['paymentStatus']>('pay_at_pickup');
  money = peso;
  get paymentLabel(): string {
    const labels: Record<Booking['paymentStatus'], string> = {
      pay_at_pickup: 'Pay at pickup',
      paid: 'Paid',
      refunded: 'Refunded',
    };
    return labels[this.paymentStatus()];
  }
}
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template:
    '<div class="state-card" role="status" aria-live="polite"><ion-icon [name]="icon()" aria-hidden="true"/><h2>{{title()}}</h2><p>{{message()}}</p><div class="state-actions"><ng-content /></div></div>',
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
  icon = input('car-sport-outline');
  constructor() {
    addIcons({ alertCircleOutline, carSportOutline });
  }
}
@Component({
  selector: 'app-loading-grid',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonSkeletonText],
  template:
    '<div class="vehicle-grid"><ion-card *ngFor="let x of [1,2,3,4]"><ion-skeleton-text animated style="height:160px;margin:0"/><ion-card-content><ion-skeleton-text animated style="width:60%;height:20px"/><ion-skeleton-text animated style="width:90%"/></ion-card-content></ion-card></div>',
})
export class LoadingGridComponent {}
@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [RouterLink, IonCard, IonCardContent, IonButton, IonIcon, ImageFallbackDirective],
  template: `<ion-card class="vehicle-card"
    ><a
      [routerLink]="['/vehicles', vehicle().id]"
      [attr.aria-label]="'View ' + vehicle().name + '. ' + availability"
      ><div class="vehicle-image">
        <img
          appImageFallback
          [src]="vehicle().image"
          [alt]="vehicle().name"
          loading="lazy"
          width="640"
          height="360"
        /><span [class.unavailable]="!vehicle().availableUnits"
          ><ion-icon [name]="vehicle().availableUnits ? 'checkmark-circle-outline' : 'ban-outline'" />{{
            availability
          }}</span
        >
      </div></a
    ><ion-card-content
      ><small>{{ vehicle().category }}</small>
      <h3>{{ vehicle().name }}</h3>
      <div class="specs">
        <span><ion-icon name="people-outline" />{{ vehicle().seats }}</span
        ><span><ion-icon name="water-outline" />{{ vehicle().fuel }}</span
        ><span><ion-icon name="speedometer-outline" />{{ vehicle().transmission }}</span>
      </div>
      <div class="card-footer">
        <div>
          <strong>{{ money(vehicle().dailyRate) }}</strong
          ><small>/day</small>
        </div>
        <ion-button
          fill="clear"
          [routerLink]="['/vehicles', vehicle().id]"
          [attr.aria-label]="'View details for ' + vehicle().name"
          >View details</ion-button
        >
      </div></ion-card-content
    ></ion-card
  >`,
})
export class VehicleCardComponent {
  vehicle = input.required<Vehicle>();
  money = peso;
  constructor() {
    addIcons({ banOutline, checkmarkCircleOutline, peopleOutline, speedometerOutline, waterOutline });
  }
  get availability(): string {
    const count = this.vehicle().availableUnits;
    if (count === 0) return 'Unavailable';
    if (count === 1) return 'Only 1 left';
    return 'Available';
  }
}
