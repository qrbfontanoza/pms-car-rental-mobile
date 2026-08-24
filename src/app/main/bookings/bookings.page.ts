import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Booking, BookingStatus } from '../../models/domain.models';
import { BookingService } from '../../models/service.interfaces';
import { EmptyStateComponent, StatusBadgeComponent } from '../../shared/ui.components';
import { peso } from '../../utils/app.utils';
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
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar><ion-title>My Bookings</ion-title></ion-toolbar
      ><ion-segment [value]="segment()" (ionChange)="segment.set($any($event.detail.value))"
        ><ion-segment-button value="active">Active</ion-segment-button
        ><ion-segment-button value="completed">Completed</ion-segment-button
        ><ion-segment-button value="cancelled">Cancelled</ion-segment-button></ion-segment
      ></ion-header
    ><ion-content
      ><div class="booking-list page-shell" *ngIf="filtered.length">
        <article *ngFor="let b of filtered">
          <img [src]="b.vehicleImage" [alt]="b.vehicleName" />
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
        *ngIf="!filtered.length"
        title="Nothing here yet"
        message="Bookings in this category will appear here."
        ><ion-button routerLink="/tabs/vehicles">Browse vehicles</ion-button></app-empty-state
      ></ion-content
    >`,
})
export class BookingsPage implements OnInit {
  readonly items = signal<Booking[]>([]);
  readonly segment = signal<Segment>('active');
  money = peso;
  constructor(private readonly service: BookingService) {}
  ngOnInit(): void {
    this.service.bookings$.subscribe((v) => this.items.set(v));
    this.service.list().subscribe((v) => this.items.set(v));
  }
  get filtered(): Booking[] {
    const groups: Record<Segment, BookingStatus[]> = {
      active: ['pending', 'confirmed'],
      completed: ['completed', 'returned_early'],
      cancelled: ['cancelled'],
    };
    return this.items().filter((b) => groups[this.segment()].includes(b.status));
  }
}
