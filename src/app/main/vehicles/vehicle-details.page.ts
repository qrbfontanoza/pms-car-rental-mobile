import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, speedometerOutline, waterOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { Vehicle } from '../../models/domain.models';
import { VehicleService } from '../../models/service.interfaces';
import { peso } from '../../utils/app.utils';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton,
    IonIcon,
    IonSkeletonText,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/vehicles" /></ion-buttons
        ><ion-title>Vehicle details</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><div *ngIf="loading()" class="page-shell">
        <ion-skeleton-text animated style="height:280px" /><ion-skeleton-text
          animated
          style="height:32px;width:70%"
        />
      </div>
      <div *ngIf="error()" class="state-card">
        <h2>Couldn’t load this vehicle</h2>
        <p>{{ error() }}</p>
        <ion-button routerLink="/tabs/vehicles">Back to vehicles</ion-button>
      </div>
      <article *ngIf="vehicle() as v" class="details">
        <div class="detail-image">
          <img [src]="v.image" [alt]="v.name" /><span [class.unavailable]="!v.availableUnits"
            >{{ v.availableUnits }} unit{{ v.availableUnits === 1 ? '' : 's' }} available</span
          >
        </div>
        <div class="detail-body">
          <p class="eyebrow">{{ v.category }}</p>
          <h1>{{ v.name }}</h1>
          <div class="detail-price">
            <strong>{{ money(v.dailyRate) }}</strong
            ><span>per day</span>
          </div>
          <div class="spec-grid">
            <div>
              <ion-icon name="people-outline" /><strong>{{ v.seats }}</strong
              ><span>Seats</span>
            </div>
            <div>
              <ion-icon name="water-outline" /><strong>{{ v.fuel }}</strong
              ><span>Fuel</span>
            </div>
            <div>
              <ion-icon name="speedometer-outline" /><strong>{{ v.transmission }}</strong
              ><span>Drive</span>
            </div>
          </div>
          <h2>About this ride</h2>
          <p>{{ v.description }}</p>
          <div class="assurance">
            <ion-icon name="shield-checkmark-outline" />
            <div>
              <strong>Checked before every trip</strong>
              <p>Cleaned, inspected, and ready for pickup.</p>
            </div>
          </div>
        </div>
      </article></ion-content
    ><ion-footer *ngIf="vehicle() as v" class="sticky-action"
      ><div>
        <span>From</span><strong>{{ money(v.dailyRate) }}/day</strong>
      </div>
      <ion-button size="large" [disabled]="!v.availableUnits" [routerLink]="['/reserve', v.id]">{{
        v.availableUnits ? 'Reserve Now' : 'Unavailable'
      }}</ion-button></ion-footer
    >`,
})
export class VehicleDetailsPage implements OnInit {
  readonly vehicle = signal<Vehicle | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  money = peso;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: VehicleService,
  ) {
    addIcons({ peopleOutline, speedometerOutline, waterOutline, shieldCheckmarkOutline });
  }
  ngOnInit(): void {
    this.service.getById(this.route.snapshot.paramMap.get('id') || '').subscribe({
      next: (v) => {
        this.vehicle.set(v);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e instanceof Error ? e.message : 'Please try again.');
        this.loading.set(false);
      },
    });
  }
}
