import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  carSportOutline,
  checkmarkCircleOutline,
  keyOutline,
  peopleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { FAQS, TESTIMONIALS } from '../../data/mock-data';
import { Vehicle, VehicleCategory } from '../../models/domain.models';
import { VehicleService } from '../../models/service.interfaces';
import { SectionHeadingComponent, VehicleCardComponent } from '../../shared/ui.components';
import { isoToday } from '../../utils/app.utils';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    SectionHeadingComponent,
    VehicleCardComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-title
          ><span class="brand"><img src="assets/logo.png" alt="" />PMS Car Rental</span></ion-title
        ></ion-toolbar
      ></ion-header
    ><ion-content
      ><section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">PREMIUM CAR RENTALS</p>
          <h1>Find Your <span>Perfect Ride</span></h1>
          <p>Book dependable vehicles for any journey, instantly.</p>
        </div>
        <form [formGroup]="searchForm" (ngSubmit)="search()" class="search-card">
          <label>Pickup date<ion-input type="date" formControlName="pickupDate" [min]="today" /></label
          ><label
            >Return date<ion-input
              type="date"
              formControlName="returnDate"
              [min]="searchForm.controls.pickupDate.value || today" /></label
          ><label
            >Vehicle type<ion-select formControlName="category" interface="popover"
              ><ion-select-option value="">Any type</ion-select-option
              ><ion-select-option *ngFor="let c of categories" [value]="c">{{
                c
              }}</ion-select-option></ion-select
            ></label
          ><ion-button type="submit" expand="block" size="large"
            ><ion-icon slot="start" name="car-sport-outline" />Search Vehicles</ion-button
          >
        </form>
      </section>
      <div class="page-shell">
        <app-section-heading eyebrow="FEATURED VEHICLES" title="Popular rides"
          ><ion-button fill="clear" routerLink="/tabs/vehicles">View all</ion-button></app-section-heading
        >
        <div class="vehicle-grid"><app-vehicle-card *ngFor="let v of featured()" [vehicle]="v" /></div>
        <section class="how">
          <app-section-heading eyebrow="HOW IT WORKS" title="Better way to rent" />
          <div class="steps">
            <article *ngFor="let step of steps; let i = index">
              <div>
                <span>{{ i + 1 }}</span
                ><ion-icon [name]="step.icon" />
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.body }}</p>
            </article>
          </div>
        </section>
        <section class="stats">
          <article><strong>34</strong><span>Total vehicles</span></article>
          <article><strong>9+</strong><span>Happy customers</span></article>
          <article><strong>10+</strong><span>Completed rentals</span></article>
          <article><strong>1+</strong><span>Years of service</span></article>
        </section>
        <section>
          <app-section-heading eyebrow="TESTIMONIALS" title="What customers say" />
          <div class="testimonial-row">
            <article *ngFor="let t of testimonials">
              <p>“{{ t.quote }}”</p>
              <strong>{{ t.name }}</strong
              ><small>{{ t.role }}</small>
            </article>
          </div>
        </section>
        <section class="faq-preview">
          <app-section-heading eyebrow="FAQ" title="Good to know"
            ><ion-button fill="clear" routerLink="/more/faq">View all</ion-button></app-section-heading
          >
          <details *ngFor="let f of faqs">
            <summary>{{ f.q }}</summary>
            <p>{{ f.a }}</p>
          </details>
        </section>
        <section class="cta">
          <h2>Ready to hit the road?</h2>
          <p>Find the right vehicle for your next trip.</p>
          <ion-button color="light" routerLink="/tabs/vehicles">Browse Vehicles</ion-button>
        </section>
      </div></ion-content
    >`,
})
export class HomePage implements OnInit {
  readonly today = isoToday();
  readonly categories: VehicleCategory[] = ['Sedan', 'SUV', 'Van', 'Minivan', 'Scooter', 'Pickup'];
  readonly featured = signal<Vehicle[]>([]);
  readonly testimonials = TESTIMONIALS;
  readonly faqs = FAQS.slice(0, 3);
  readonly steps = [
    {
      icon: 'car-sport-outline',
      title: 'Choose your vehicle',
      body: 'Browse a wide selection and choose what fits your trip.',
    },
    {
      icon: 'calendar-outline',
      title: 'Select your dates',
      body: 'Pick your rental period and see transparent pricing.',
    },
    { icon: 'key-outline', title: 'Reserve & go', body: 'Confirm securely, then pick up your keys.' },
  ];
  readonly searchForm = this.fb.nonNullable.group({
    pickupDate: [this.today, Validators.required],
    returnDate: [this.today, Validators.required],
    category: [''],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly vehicles: VehicleService,
    private readonly router: Router,
  ) {
    addIcons({
      calendarOutline,
      carSportOutline,
      checkmarkCircleOutline,
      keyOutline,
      peopleOutline,
      shieldCheckmarkOutline,
    });
  }
  ngOnInit(): void {
    this.vehicles.list({}, 1, 14).subscribe((r) => this.featured.set(r.data.filter((v) => v.featured)));
  }
  search(): void {
    if (this.searchForm.invalid) return;
    void this.router.navigate(['/tabs/vehicles'], { queryParams: this.searchForm.getRawValue() });
  }
}
