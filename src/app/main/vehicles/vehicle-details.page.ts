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
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { peopleOutline, speedometerOutline, waterOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { Vehicle } from '../../models/domain.models';
import { VehicleService } from '../../models/service.interfaces';
import { peso } from '../../utils/app.utils';
import { ImageFallbackDirective } from '../../shared/image-fallback.directive';
import { EmptyStateComponent } from '../../shared/ui.components';
import { ScreenSkeletonComponent } from '../../shared/screen-skeleton.component';
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
    ImageFallbackDirective,
    EmptyStateComponent,
    ScreenSkeletonComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/vehicles" /></ion-buttons
        ><ion-title>Vehicle details</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><app-screen-skeleton *ngIf="loading()" variant="details" />
      <app-empty-state
        *ngIf="error()"
        icon="alert-circle-outline"
        title="Couldn’t load this vehicle"
        [message]="error()"
      >
        <ion-button fill="outline" (click)="load()">Try again</ion-button>
        <ion-button fill="clear" routerLink="/tabs/vehicles">Back to vehicles</ion-button>
      </app-empty-state>
      <article *ngIf="vehicle() as v" class="details">
        <div class="detail-image">
          <img appImageFallback [src]="v.image" [alt]="v.name" width="1200" height="675" /><span
            [class.unavailable]="!v.availableUnits"
            >{{ availability(v) }}</span
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
          <p>{{ v.description || 'More information about this vehicle will be available soon.' }}</p>
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
        <span>{{ availability(v) }}</span
        ><strong>{{ money(v.dailyRate) }}/day</strong>
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
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
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
  availability(vehicle: Vehicle): string {
    if (vehicle.availableUnits === 0) return 'Unavailable';
    if (vehicle.availableUnits === 1) return 'Only 1 left';
    return 'Available';
  }
}
