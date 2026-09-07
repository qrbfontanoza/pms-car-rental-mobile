import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { Subscription, interval } from 'rxjs';
import { Booking, BookingStatus } from '../../models/domain.models';
import { BookingService } from '../../models/service.interfaces';
import { EmptyStateComponent, StatusBadgeComponent } from '../../shared/ui.components';
import { peso } from '../../utils/app.utils';
import { ImageFallbackDirective } from '../../shared/image-fallback.directive';
import { ScreenSkeletonComponent } from '../../shared/screen-skeleton.component';
type Segment = 'active' | 'completed' | 'cancelled';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonButton,
    IonRefresher,
    IonRefresherContent,
    IonToast,
    StatusBadgeComponent,
    EmptyStateComponent,
    ImageFallbackDirective,
    ScreenSkeletonComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar><ion-title>My Bookings</ion-title></ion-toolbar
      ><ion-segment [value]="segment()" (ionChange)="segment.set($any($event.detail.value))"
        ><ion-segment-button value="active">Active</ion-segment-button
        ><ion-segment-button value="completed">Completed</ion-segment-button
        ><ion-segment-button value="cancelled">Cancelled</ion-segment-button></ion-segment
      ></ion-header
    ><ion-content
      ><ion-refresher slot="fixed" (ionRefresh)="refresh($event)"
        ><ion-refresher-content pullingText="Pull to refresh bookings"
      /></ion-refresher>
      <app-screen-skeleton *ngIf="loading() && !items().length" variant="bookings" />
      <div class="booking-list page-shell" *ngIf="filtered.length">
        <article *ngFor="let b of filtered">
          <img
            appImageFallback
            [src]="b.vehicleImage"
            [alt]="b.vehicleName"
            width="480"
            height="270"
            loading="lazy"
          />
          <div class="booking-card-body">
            <div class="booking-card-head">
              <small>{{ b.reference }}</small
              ><app-status-badge [status]="b.status" />
            </div>
            <h2>{{ b.vehicleName }}</h2>
            <p>{{ b.pickupDate | date: 'mediumDate' }} – {{ b.returnDate | date: 'mediumDate' }}</p>
            <div class="booking-card-foot">
              <div>
                <strong>{{ money(b.preview.total) }}</strong
                ><small>Created {{ b.createdAt | date: 'mediumDate' }}</small>
              </div>
              <ion-button fill="outline" size="small" [routerLink]="['/booking', b.id]">Details</ion-button>
            </div>
          </div>
        </article>
      </div>
      <app-empty-state
        *ngIf="!filtered.length && !loading()"
        [title]="emptyTitle"
        [message]="loadError() || emptyMessage"
        ><ion-button *ngIf="loadError(); else browse" fill="outline" (click)="refresh()">Try again</ion-button
        ><ng-template #browse
          ><ion-button routerLink="/tabs/vehicles">Browse vehicles</ion-button></ng-template
        ></app-empty-state
      ></ion-content
    ><ion-toast
      [isOpen]="!!toastMessage()"
      [message]="toastMessage()"
      [duration]="2200"
      (didDismiss)="toastMessage.set('')"
    /> `,
  styles: [
    `
      ion-segment-button {
        --color: var(--ion-text-color);
        --color-checked: var(--ion-color-primary);
      }
    `,
  ],
})
export class BookingsPage implements OnInit, OnDestroy {
  readonly items = signal<Booking[]>([]);
  readonly segment = signal<Segment>('active');
  readonly loading = signal(false);
  readonly loadError = signal('');
  readonly toastMessage = signal('');
  money = peso;
  private bookingsSubscription?: Subscription;
  private pollingSubscription?: Subscription;
  constructor(private readonly service: BookingService) {}
  ngOnInit(): void {
    this.bookingsSubscription = this.service.bookings$.subscribe((v) => this.items.set(v));
  }
  ngOnDestroy(): void {
    this.bookingsSubscription?.unsubscribe();
    this.stopPolling();
  }
  ionViewWillEnter(): void {
    this.refresh();
  }
  ionViewDidEnter(): void {
    this.stopPolling();
    this.pollingSubscription = interval(15000).subscribe(() => this.refresh(undefined, false));
  }
  ionViewDidLeave(): void {
    this.stopPolling();
  }
  refresh(event?: CustomEvent, showFeedback = true): void {
    if (this.loading()) {
      this.completeRefresher(event);
      return;
    }
    this.loading.set(true);
    this.loadError.set('');
    this.service.list().subscribe({
      next: (bookings) => {
        this.items.set(bookings);
        if (event && showFeedback) this.toastMessage.set('Bookings updated.');
      },
      error: () => {
        this.loadError.set('Check your connection and try again.');
        if (this.items().length && showFeedback) this.toastMessage.set('Could not refresh bookings.');
        this.loading.set(false);
        this.completeRefresher(event);
      },
      complete: () => {
        this.loading.set(false);
        this.completeRefresher(event);
      },
    });
  }
  get filtered(): Booking[] {
    const groups: Record<Segment, BookingStatus[]> = {
      active: ['pending', 'confirmed'],
      completed: ['completed', 'returned_early'],
      cancelled: ['cancelled'],
    };
    return this.items().filter((b) => groups[this.segment()].includes(b.status));
  }
  get emptyTitle(): string {
    if (this.loadError()) return 'Could not refresh bookings';
    return {
      active: 'No active bookings',
      completed: 'No completed rentals yet',
      cancelled: 'No cancelled bookings',
    }[this.segment()];
  }
  get emptyMessage(): string {
    return {
      active: 'When you reserve a vehicle, its progress will appear here.',
      completed: 'Your finished and early-returned rentals will appear here.',
      cancelled: 'Bookings you cancel will appear here for reference.',
    }[this.segment()];
  }

  private completeRefresher(event?: CustomEvent): void {
    const refresher = event?.target as HTMLIonRefresherElement | undefined;
    void refresher?.complete();
  }

  private stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }
}
