import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, callOutline, documentTextOutline, refreshOutline } from 'ionicons/icons';
import { Subscription, interval } from 'rxjs';
import { Booking } from '../../models/domain.models';
import { BookingService } from '../../models/service.interfaces';
import {
  EmptyStateComponent,
  PriceBreakdownComponent,
  StatusBadgeComponent,
} from '../../shared/ui.components';
import { isoToday } from '../../utils/app.utils';
import { ImageFallbackDirective } from '../../shared/image-fallback.directive';
import { ScreenSkeletonComponent } from '../../shared/screen-skeleton.component';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonToast,
    StatusBadgeComponent,
    PriceBreakdownComponent,
    ImageFallbackDirective,
    EmptyStateComponent,
    ScreenSkeletonComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/bookings" /></ion-buttons
        ><ion-title>Booking details</ion-title
        ><ion-buttons slot="end"
          ><ion-button aria-label="Refresh booking" [disabled]="loading()" (click)="load()"
            ><ion-icon
              slot="icon-only"
              name="refresh-outline" /></ion-button></ion-buttons></ion-toolbar></ion-header
    ><ion-content
      ><ion-refresher slot="fixed" (ionRefresh)="load($event)"
        ><ion-refresher-content pullingText="Pull to refresh booking"
      /></ion-refresher>
      <app-screen-skeleton *ngIf="loading() && !booking()" variant="booking" />
      <app-empty-state
        *ngIf="loadError() && !booking()"
        icon="alert-circle-outline"
        title="Booking unavailable"
        [message]="loadError()"
      >
        <ion-button fill="outline" (click)="load()">Try again</ion-button>
      </app-empty-state>
      <div class="booking-shell" *ngIf="booking() as b">
        <div class="success-banner" *ngIf="created">
          <ion-icon name="document-text-outline" />
          <div>
            <strong>Reservation received</strong>
            <p>Your booking reference is {{ b.reference }}.</p>
          </div>
        </div>
        <div class="success-banner warning" *ngIf="licenseUploadFailed">
          <ion-icon name="alert-circle-outline" />
          <div>
            <strong>Booking saved; license upload needs attention</strong>
            <p>Your reservation was created. Upload the license again from your profile—do not create another booking.</p>
          </div>
        </div>
        <div class="booking-vehicle">
          <img appImageFallback [src]="b.vehicleImage" [alt]="b.vehicleName" width="480" height="270" />
          <div>
            <app-status-badge [status]="b.status" />
            <h1>{{ b.vehicleName }}</h1>
            <small>{{ b.reference }}</small>
          </div>
        </div>
        <div class="summary-list">
          <div>
            <span>Pickup</span><strong>{{ b.pickupDate | date: 'fullDate' }}</strong>
          </div>
          <div>
            <span>Return</span><strong>{{ b.returnDate | date: 'fullDate' }}</strong>
          </div>
          <div>
            <span>Contact</span><strong>{{ b.contactNumber }}</strong>
          </div>
          <div>
            <span>Created</span><strong>{{ b.createdAt | date: 'medium' }}</strong>
          </div>
        </div>
        <app-price-breakdown [preview]="b.preview" [paymentStatus]="b.paymentStatus" />
        <div class="action-grid">
          <ion-button fill="outline" [routerLink]="['/receipt', b.id]"
            ><ion-icon slot="start" name="document-text-outline" />View receipt</ion-button
          ><ion-button fill="outline" routerLink="/more/support"
            ><ion-icon slot="start" name="call-outline" />Contact support</ion-button
          ><ion-button
            color="danger"
            fill="outline"
            *ngIf="canCancel(b)"
            [disabled]="actionBusy()"
            (click)="act('cancel')"
            ><ion-spinner *ngIf="actionBusy()" slot="start" name="crescent" />{{
              actionBusy() ? 'Updating…' : 'Cancel booking'
            }}</ion-button
          >
          <p class="action-note" *ngIf="isActive(b) && !canCancel(b)">
            This booking has reached its pickup date and can no longer be cancelled.
          </p>
          <ion-button
            color="warning"
            fill="outline"
            *ngIf="canReturnEarly(b)"
            [disabled]="actionBusy()"
            (click)="act('return')"
            ><ion-spinner *ngIf="actionBusy()" slot="start" name="crescent" />{{
              actionBusy() ? 'Updating…' : 'Return early'
            }}</ion-button
          >
        </div>
      </div>
      <ion-toast [isOpen]="!!message()" [message]="message()" [duration]="2500"
    /></ion-content>`,
})
export class BookingDetailsPage implements OnInit, OnDestroy {
  readonly booking = signal<Booking | null>(null);
  readonly message = signal('');
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly actionBusy = signal(false);
  created = false;
  licenseUploadFailed = false;
  private bookingId = '';
  private pollingSubscription?: Subscription;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: BookingService,
    private readonly alerts: AlertController,
  ) {
    addIcons({ alertCircleOutline, callOutline, documentTextOutline, refreshOutline });
  }
  ngOnInit(): void {
    this.created = this.route.snapshot.queryParamMap.has('created');
    this.licenseUploadFailed = this.route.snapshot.queryParamMap.get('licenseUploadFailed') === 'true';
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';
  }
  ngOnDestroy(): void {
    this.stopPolling();
  }
  ionViewWillEnter(): void {
    this.load();
  }
  ionViewDidEnter(): void {
    this.stopPolling();
    this.pollingSubscription = interval(15000).subscribe(() => this.load(undefined, false));
  }
  ionViewDidLeave(): void {
    this.stopPolling();
  }
  load(event?: CustomEvent, showError = true): void {
    if (!this.bookingId || this.loading()) {
      this.completeRefresher(event);
      return;
    }
    this.loading.set(true);
    this.loadError.set('');
    this.service.getById(this.bookingId).subscribe({
      next: (booking) => this.booking.set(booking),
      error: () => {
        if (showError) this.loadError.set('Check your connection and try again.');
        this.loading.set(false);
        this.completeRefresher(event);
      },
      complete: () => {
        this.loading.set(false);
        this.completeRefresher(event);
      },
    });
  }
  async act(type: 'cancel' | 'return'): Promise<void> {
    const alert = await this.alerts.create({
      header: type === 'cancel' ? 'Cancel this booking?' : 'Return vehicle early?',
      message: 'This action updates the booking immediately and cannot be undone here.',
      buttons: [
        { text: 'Keep booking', role: 'cancel' },
        { text: 'Confirm', role: 'confirm' },
      ],
    });
    await alert.present();
    if ((await alert.onDidDismiss()).role !== 'confirm') return;
    const b = this.booking();
    if (!b) return;
    this.actionBusy.set(true);
    (type === 'cancel' ? this.service.cancel(b.id) : this.service.returnEarly(b.id)).subscribe({
      next: (value) => {
        this.booking.set(value);
        this.message.set(type === 'cancel' ? 'Booking cancelled.' : 'Vehicle marked returned early.');
      },
      error: (error: unknown) => {
        this.message.set(error instanceof Error ? error.message : 'Could not update this booking.');
        this.actionBusy.set(false);
      },
      complete: () => this.actionBusy.set(false),
    });
  }
  canCancel(booking: Booking): boolean {
    return this.isActive(booking) && booking.pickupDate > isoToday();
  }
  isActive(booking: Booking): boolean {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }
  canReturnEarly(booking: Booking): boolean {
    const today = isoToday();
    return booking.status === 'confirmed' && booking.pickupDate <= today && booking.returnDate >= today;
  }
  private completeRefresher(event?: CustomEvent): void {
    void (event?.target as HTMLIonRefresherElement | undefined)?.complete();
  }
  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }
}
