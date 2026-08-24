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
import { peopleOutline, speedometerOutline, waterOutline, carSportOutline } from 'ionicons/icons';
import { BookingPricePreview, BookingStatus, Vehicle } from '../models/domain.models';
import { peso } from '../utils/app.utils';
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
  imports: [IonBadge],
  template: '<ion-badge [class]="status()">{{label}}</ion-badge>',
})
export class StatusBadgeComponent {
  status = input.required<BookingStatus>();
  get label() {
    return this.status().replace('_', ' ');
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
    <small>Payment: Pay at pickup</small>
  </div>`,
  imports: [CommonModule],
})
export class PriceBreakdownComponent {
  preview = input.required<BookingPricePreview>();
  money = peso;
}
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template:
    '<div class="state-card"><ion-icon name="car-sport-outline"/><h3>{{title()}}</h3><p>{{message()}}</p><ng-content /></div>',
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
  constructor() {
    addIcons({ carSportOutline });
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
  imports: [RouterLink, IonCard, IonCardContent, IonButton, IonIcon],
  template: `<ion-card class="vehicle-card"
    ><a [routerLink]="['/vehicles', vehicle().id]" [attr.aria-label]="'View ' + vehicle().name"
      ><div class="vehicle-image">
        <img [src]="vehicle().image" [alt]="vehicle().name" loading="lazy" /><span
          [class.unavailable]="!vehicle().availableUnits"
          >{{ vehicle().availableUnits ? vehicle().availableUnits + ' available' : 'Unavailable' }}</span
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
        <ion-button fill="clear" [routerLink]="['/vehicles', vehicle().id]">View</ion-button>
      </div></ion-card-content
    ></ion-card
  >`,
})
export class VehicleCardComponent {
  vehicle = input.required<Vehicle>();
  money = peso;
  constructor() {
    addIcons({ peopleOutline, speedometerOutline, waterOutline });
  }
}
