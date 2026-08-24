import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AlertController,
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
import { callOutline, documentTextOutline } from 'ionicons/icons';
import { Booking } from '../../models/domain.models';
import { BookingService } from '../../models/service.interfaces';
import { PriceBreakdownComponent, StatusBadgeComponent } from '../../shared/ui.components';
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
    IonToast,
    StatusBadgeComponent,
    PriceBreakdownComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/bookings" /></ion-buttons
        ><ion-title>Booking details</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><div class="booking-shell" *ngIf="booking() as b">
        <div class="success-banner" *ngIf="created">
          <ion-icon name="document-text-outline" />
          <div>
            <strong>Reservation received</strong>
            <p>Your booking reference is {{ b.reference }}.</p>
          </div>
        </div>
        <div class="booking-vehicle">
          <img [src]="b.vehicleImage" [alt]="b.vehicleName" />
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
        <app-price-breakdown [preview]="b.preview" />
        <div class="action-grid">
          <ion-button fill="outline" [routerLink]="['/receipt', b.id]"
            ><ion-icon slot="start" name="document-text-outline" />View receipt</ion-button
          ><ion-button fill="outline" routerLink="/more/support"
            ><ion-icon slot="start" name="call-outline" />Contact support</ion-button
          ><ion-button
            color="danger"
            fill="outline"
            *ngIf="b.status === 'pending' || b.status === 'confirmed'"
            (click)="act('cancel')"
            >Cancel booking</ion-button
          ><ion-button color="warning" fill="outline" *ngIf="b.status === 'confirmed'" (click)="act('return')"
            >Return early</ion-button
          >
        </div>
      </div>
      <ion-toast [isOpen]="!!message()" [message]="message()" [duration]="2500"
    /></ion-content>`,
})
export class BookingDetailsPage implements OnInit {
  readonly booking = signal<Booking | null>(null);
  readonly message = signal('');
  created = false;
  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: BookingService,
    private readonly alerts: AlertController,
  ) {
    addIcons({ callOutline, documentTextOutline });
  }
  ngOnInit(): void {
    this.created = this.route.snapshot.queryParamMap.has('created');
    this.service.bookings$.subscribe((list) =>
      this.booking.set(list.find((b) => b.id === this.route.snapshot.paramMap.get('id')) || null),
    );
    this.service.list().subscribe();
  }
  async act(type: 'cancel' | 'return'): Promise<void> {
    const alert = await this.alerts.create({
      header: type === 'cancel' ? 'Cancel this booking?' : 'Return vehicle early?',
      message: 'This mock action updates the booking immediately.',
      buttons: [
        { text: 'Keep booking', role: 'cancel' },
        { text: 'Confirm', role: 'confirm' },
      ],
    });
    await alert.present();
    if ((await alert.onDidDismiss()).role !== 'confirm') return;
    const b = this.booking();
    if (!b) return;
    (type === 'cancel' ? this.service.cancel(b.id) : this.service.returnEarly(b.id)).subscribe((v) => {
      this.booking.set(v);
      this.message.set(type === 'cancel' ? 'Booking cancelled.' : 'Vehicle marked returned early.');
    });
  }
}
