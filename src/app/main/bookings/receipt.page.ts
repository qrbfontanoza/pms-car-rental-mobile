import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, shareOutline } from 'ionicons/icons';
import { Receipt } from '../../models/domain.models';
import { ReceiptService } from '../../models/service.interfaces';
import {
  EmptyStateComponent,
  PriceBreakdownComponent,
  StatusBadgeComponent,
} from '../../shared/ui.components';
import { ImageFallbackDirective } from '../../shared/image-fallback.directive';
import { ScreenSkeletonComponent } from '../../shared/screen-skeleton.component';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
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
        ><ion-title>Receipt</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><app-screen-skeleton *ngIf="loading()" variant="receipt" />
      <app-empty-state
        *ngIf="error()"
        icon="alert-circle-outline"
        title="Receipt unavailable"
        [message]="error()"
      >
        <ion-button fill="outline" (click)="load()">Try again</ion-button>
      </app-empty-state>
      <article class="receipt page-shell" *ngIf="receipt() as r">
        <header>
          <img src="assets/logo.png" alt="PMS Car Rental" />
          <div>
            <h1>PMS Car Rental</h1>
            <p>Cubao, Quezon City</p>
          </div>
        </header>
        <div class="receipt-ref">
          <span>BOOKING RECEIPT</span><strong>{{ r.booking.reference }}</strong
          ><app-status-badge [status]="r.booking.status" />
        </div>
        <section>
          <h2>Customer</h2>
          <p>
            <strong>{{ r.customer.fullName }}</strong
            ><br />{{ r.customer.email }}<br />{{ r.booking.contactNumber }}
          </p>
        </section>
        <section>
          <h2>Vehicle</h2>
          <div class="receipt-vehicle">
            <img appImageFallback [src]="r.vehicle.image" [alt]="r.vehicle.name" width="400" height="225" />
            <div>
              <strong>{{ r.vehicle.name }}</strong>
              <p>{{ r.vehicle.category }} · {{ r.vehicle.transmission }}</p>
            </div>
          </div>
        </section>
        <section class="summary-list">
          <div>
            <span>Pickup</span><strong>{{ r.booking.pickupDate | date: 'fullDate' }}</strong>
          </div>
          <div>
            <span>Return</span><strong>{{ r.booking.returnDate | date: 'fullDate' }}</strong>
          </div>
          <div>
            <span>Payment status</span><strong>{{ r.booking.paymentStatus.replaceAll('_', ' ') }}</strong>
          </div>
        </section>
        <app-price-breakdown [preview]="r.booking.preview" [paymentStatus]="r.booking.paymentStatus" />
        <footer>
          <p>Issued {{ r.issuedAt | date: 'medium' }}</p>
          <p>Thank you for choosing PMS Car Rental.</p>
        </footer>
      </article>
      <div class="receipt-actions" *ngIf="receipt() as r">
        <ion-button fill="outline" (click)="share(r)" [disabled]="!!action()"
          ><ion-icon slot="start" name="share-outline" />Share</ion-button
        ><ion-button (click)="save(r)" [disabled]="!!action()"
          ><ion-icon slot="start" name="download-outline" />Save receipt</ion-button
        >
      </div>
      <ion-toast [isOpen]="!!message()" [message]="message()" [duration]="2200"
    /></ion-content>`,
})
export class ReceiptPage implements OnInit {
  readonly receipt = signal<Receipt | null>(null);
  readonly message = signal('');
  readonly loading = signal(true);
  readonly error = signal('');
  readonly action = signal<'share' | 'save' | null>(null);
  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ReceiptService,
  ) {
    addIcons({ downloadOutline, shareOutline });
  }
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.get(this.route.snapshot.paramMap.get('id') || '').subscribe({
      next: (receipt) => {
        this.receipt.set(receipt);
        this.loading.set(false);
      },
      error: () => {
        this.receipt.set(null);
        this.error.set('Check your connection and try again.');
        this.loading.set(false);
      },
    });
  }
  share(r: Receipt): void {
    if (this.action()) return;
    this.action.set('share');
    this.service
      .share(r)
      .pipe(finalize(() => this.action.set(null)))
      .subscribe({
        next: () => this.message.set('Receipt shared.'),
        error: (error: unknown) => this.message.set(this.actionError(error, 'Could not share the receipt.')),
      });
  }
  save(r: Receipt): void {
    if (this.action()) return;
    this.action.set('save');
    this.service
      .save(r)
      .pipe(finalize(() => this.action.set(null)))
      .subscribe({
        next: (message) => this.message.set(message),
        error: (error: unknown) => this.message.set(this.actionError(error, 'Could not save the receipt.')),
      });
  }

  private actionError(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
