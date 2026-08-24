import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonSearchbar,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { FAQS } from '../../data/mock-data';
import { AuthService, ProfileService, SupportService } from '../../models/service.interfaces';
type Page = 'faq' | 'about' | 'privacy' | 'support';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonInput,
    IonTextarea,
    IonButton,
    IonToast,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/profile" /></ion-buttons
        ><ion-title>{{ title }}</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><main class="content-page" *ngIf="page === 'faq'">
        <h1>Top PMS Car Rental Questions</h1>
        <p>Find answers to the most commonly asked questions.</p>
        <ion-searchbar
          placeholder="Search questions"
          [(ngModel)]="query"
          [ngModelOptions]="{ standalone: true }"
        />
        <details *ngFor="let f of filteredFaqs">
          <summary>{{ f.q }}</summary>
          <p>{{ f.a }}</p>
        </details>
      </main>
      <main class="content-page" *ngIf="page === 'about'">
        <p class="eyebrow">ABOUT PMS</p>
        <h1>Mobility made simple</h1>
        <img class="about-image" src="assets/hero.jpg" alt="PMS Car Rental vehicle" />
        <h2>Our story</h2>
        <p>
          PMS Car Rental provides reliable, affordable, and hassle-free vehicle rentals for business and
          leisure travelers. The project brings vehicle discovery, transparent rental fees, online
          reservations, and customer rental management into one accessible experience.
        </p>
        <h2>Mission & vision</h2>
        <p>
          Our mission is to make every rental convenient, efficient, and easy. Our vision is a simpler, more
          accessible digital car-rental experience for customers and staff.
        </p>
        <h2>Why choose PMS</h2>
        <div class="value-grid">
          <article>
            <strong>Variety of brands</strong>
            <p>Cars, vans, pickups, and scooters for every trip.</p>
          </article>
          <article>
            <strong>Awesome support</strong>
            <p>Helpful guidance before, during, and after your rental.</p>
          </article>
          <article>
            <strong>Maximum freedom</strong>
            <p>Choose dates and vehicles around your plans.</p>
          </article>
          <article>
            <strong>Flexible on the go</strong>
            <p>Manage bookings from wherever you are.</p>
          </article>
        </div>
        <div class="contact-card">
          <h2>Contact</h2>
          <p>(02) 1234 5678<br />info@pmsrentals.ph<br />Cubao, Quezon City</p>
          <ion-button routerLink="/more/support">Send a message</ion-button>
        </div>
      </main>
      <main class="content-page policy" *ngIf="page === 'privacy'">
        <p class="eyebrow">YOUR DATA</p>
        <h1>Privacy Policy</h1>
        <p>Last updated August 2026</p>
        <h2>1. Introduction</h2>
        <p>
          PMS Car Rental respects your privacy and processes information in line with the Philippine Data
          Privacy Act of 2012 (RA 10173).
        </p>
        <h2>2. Information we collect</h2>
        <p>
          We may collect account details, contact information, rental dates, booking history, age, profile
          images, and driver’s-license images used to establish eligibility.
        </p>
        <h2>3. Purpose of collection</h2>
        <p>
          Information supports account access, reservation fulfillment, driving-age and license checks,
          customer support, security, and service improvement.
        </p>
        <h2>4. Data retention</h2>
        <p>
          Information is kept only as long as reasonably necessary for the purpose it was collected and any
          applicable legal obligations. A fixed production retention period must be finalized before launch.
        </p>
        <h2>5. Sharing and third parties</h2>
        <p>
          We do not sell personal information. Limited data may be disclosed to authorized staff and service
          providers needed to deliver a rental.
        </p>
        <h2>6. Security</h2>
        <p>
          The production service must use access controls, encrypted transport, secure password hashing,
          auditing, and a protected backend API. This preview uses only safe local mock state.
        </p>
        <h2>7. Your rights</h2>
        <p>
          You may request access, correction, deletion, or object to certain processing, subject to applicable
          law.
        </p>
        <h2>8. Contact</h2>
        <p>For privacy questions, contact the PMS Car Rental project representative at info@pmsrentals.ph.</p>
      </main>
      <main class="content-page" *ngIf="page === 'support'">
        <p class="eyebrow">WE’RE HERE TO HELP</p>
        <h1>Contact & support</h1>
        <p>Call (02) 1234 5678 or send a message below.</p>
        <div class="guest-card" *ngIf="!auth.isAuthenticated">
          <h2>Sign in to send a message</h2>
          <p>You can still view our contact details without an account.</p>
          <ion-button routerLink="/auth/login" [queryParams]="{ returnUrl: '/more/support' }"
            >Sign in</ion-button
          >
        </div>
        <form *ngIf="auth.isAuthenticated" [formGroup]="form" (ngSubmit)="send()">
          <ion-input label="Name" labelPlacement="stacked" formControlName="name" /><ion-input
            label="Email"
            labelPlacement="stacked"
            type="email"
            formControlName="email"
          /><ion-input label="Subject" labelPlacement="stacked" formControlName="subject" /><ion-textarea
            label="How can we help?"
            labelPlacement="stacked"
            rows="6"
            formControlName="message"
          /><ion-button expand="block" size="large" type="submit" [disabled]="form.invalid"
            >Send message</ion-button
          >
        </form>
      </main>
      <ion-toast
        [isOpen]="sent()"
        message="Message sent to mock support."
        [duration]="2400"
        (didDismiss)="sent.set(false)"
    /></ion-content>`,
})
export class MorePage implements OnInit {
  page: Page = 'faq';
  query = '';
  readonly sent = signal(false);
  readonly faqs = FAQS;
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });
  constructor(
    private readonly route: ActivatedRoute,
    public readonly auth: AuthService,
    private readonly profiles: ProfileService,
    private readonly support: SupportService,
    private readonly fb: FormBuilder,
  ) {}
  ngOnInit(): void {
    const p = this.route.snapshot.paramMap.get('page');
    if (['faq', 'about', 'privacy', 'support'].includes(p || '')) this.page = p as Page;
    if (this.auth.isAuthenticated)
      this.profiles.get().subscribe((v) => this.form.patchValue({ name: v.fullName, email: v.email }));
  }
  get title(): string {
    return { faq: 'FAQ', about: 'About Us', privacy: 'Privacy Policy', support: 'Support' }[this.page];
  }
  get filteredFaqs() {
    const q = this.query.toLowerCase();
    return this.faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q));
  }
  send(): void {
    if (this.form.invalid) return;
    this.support.send(this.form.getRawValue()).subscribe(() => {
      this.sent.set(true);
      this.form.controls.subject.reset();
      this.form.controls.message.reset();
    });
  }
}
