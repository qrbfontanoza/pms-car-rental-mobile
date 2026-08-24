import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { PriceBreakdownComponent, StatusBadgeComponent } from '../../shared/ui.components';
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
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/bookings" /></ion-buttons
        ><ion-title>Receipt</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><article class="receipt page-shell" *ngIf="receipt() as r">
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
            <img [src]="r.vehicle.image" [alt]="r.vehicle.name" />
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
        <app-price-breakdown [preview]="r.booking.preview" />
        <footer>
          <p>Issued {{ r.issuedAt | date: 'medium' }}</p>
          <p>Thank you for choosing PMS Car Rental.</p>
        </footer>
      </article>
      <div class="receipt-actions" *ngIf="receipt() as r">
        <ion-button fill="outline" (click)="share(r)"
          ><ion-icon slot="start" name="share-outline" />Share</ion-button
        ><ion-button (click)="save(r)"
          ><ion-icon slot="start" name="download-outline" />Save / Print</ion-button
        >
      </div>
      <ion-toast [isOpen]="!!message()" [message]="message()" [duration]="2200"
    /></ion-content>`,
})
export class ReceiptPage implements OnInit {
  readonly receipt = signal<Receipt | null>(null);
  readonly message = signal('');
  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: ReceiptService,
  ) {
    addIcons({ downloadOutline, shareOutline });
  }
  ngOnInit(): void {
    this.service.get(this.route.snapshot.paramMap.get('id') || '').subscribe((r) => this.receipt.set(r));
  }
  share(r: Receipt): void {
    this.service.share(r).subscribe(() => this.message.set('Share is ready for Capacitor integration.'));
  }
  save(r: Receipt): void {
    this.service
      .save(r)
      .subscribe(() => this.message.set('Save/Print is ready for Capacitor Filesystem integration.'));
  }
}
