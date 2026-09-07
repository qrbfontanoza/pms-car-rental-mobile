import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonProgressBar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, documentAttachOutline } from 'ionicons/icons';
import { BookingPricePreview, Vehicle } from '../../models/domain.models';
import {
  BookingService,
  MediaService,
  ProfileService,
  VehicleService,
} from '../../models/service.interfaces';
import { EmptyStateComponent, PriceBreakdownComponent } from '../../shared/ui.components';
import { dateRangeValidator, isoToday, peso } from '../../utils/app.utils';
import { ImageFallbackDirective } from '../../shared/image-fallback.directive';
import { ScreenSkeletonComponent } from '../../shared/screen-skeleton.component';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonProgressBar,
    IonSpinner,
    IonInput,
    IonButton,
    IonIcon,
    IonText,
    IonToast,
    PriceBreakdownComponent,
    ImageFallbackDirective,
    EmptyStateComponent,
    ScreenSkeletonComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/vehicles" /></ion-buttons
        ><ion-title>Reserve vehicle</ion-title></ion-toolbar
      ><ion-progress-bar [value]="step() / 4" /></ion-header
    ><ion-content
      ><app-screen-skeleton *ngIf="vehicleLoading()" variant="booking" />
      <app-empty-state
        *ngIf="vehicleError()"
        icon="alert-circle-outline"
        title="Couldn’t start this reservation"
        [message]="vehicleError()"
      >
        <ion-button fill="outline" (click)="loadVehicle()">Try again</ion-button>
      </app-empty-state>
      <div class="booking-shell" *ngIf="vehicle() as v">
        <p class="eyebrow">STEP {{ step() }} OF 4</p>
        <section *ngIf="step() === 1">
          <h1>Review your ride</h1>
          <div class="booking-vehicle">
            <img appImageFallback [src]="v.image" [alt]="v.name" width="480" height="270" />
            <div>
              <small>{{ v.category }}</small>
              <h2>{{ v.name }}</h2>
              <strong>{{ money(v.dailyRate) }}/day</strong>
            </div>
          </div>
          <p>{{ v.description }}</p>
        </section>
        <form [formGroup]="form">
          <section *ngIf="step() === 2">
            <h1>When do you need it?</h1>
            <ion-input
              type="date"
              label="Pickup date"
              labelPlacement="stacked"
              [min]="today"
              formControlName="pickupDate"
            /><ion-input
              type="date"
              label="Return date"
              labelPlacement="stacked"
              [min]="form.controls.pickupDate.value || today"
              formControlName="returnDate"
            /><ion-text color="danger" *ngIf="form.hasError('dateRange') || form.hasError('pastDate')"
              >Choose today or later; return cannot be before pickup.</ion-text
            >
            <h2>Renter details</h2>
            <ion-input
              label="Contact number"
              labelPlacement="stacked"
              inputmode="tel"
              formControlName="contactNumber"
            /><ion-input
              label="Age"
              labelPlacement="stacked"
              type="number"
              formControlName="renterAge"
            /><ion-text
              color="danger"
              *ngIf="form.controls.renterAge.touched && form.controls.renterAge.invalid"
              >Renter must be at least 18.</ion-text
            ><button type="button" class="image-picker" (click)="pickLicense()">
              <ion-icon name="document-attach-outline" /><span>{{
                licenseName() || 'Optional license image'
              }}</span
              ><strong>Choose</strong>
            </button>
          </section>
          <section *ngIf="step() === 3">
            <h1>Voucher & price</h1>
            <div class="voucher-row">
              <ion-input
                label="Voucher code"
                labelPlacement="stacked"
                placeholder="Enter voucher code"
                formControlName="voucherCode"
              /><ion-button fill="outline" [disabled]="calculating()" (click)="calculate()"
                ><ion-spinner *ngIf="calculating()" slot="start" name="crescent" />{{
                  calculating() ? 'Applying…' : 'Apply'
                }}</ion-button
              >
            </div>
            <p class="hint">Enter an active PMS voucher code, if you have one.</p>
            <app-price-breakdown *ngIf="preview() as p" [preview]="p" />
            <p class="secure-note">Payment is collected by PMS staff at pickup. No payment is recorded when you reserve.</p>
          </section>
          <section *ngIf="step() === 4">
            <h1>Review & confirm</h1>
            <div class="summary-list">
              <div>
                <span>Vehicle</span><strong>{{ v.name }}</strong>
              </div>
              <div>
                <span>Rental period</span
                ><strong
                  >{{ form.controls.pickupDate.value | date: 'mediumDate' }} –
                  {{ form.controls.returnDate.value | date: 'mediumDate' }}</strong
                >
              </div>
              <div>
                <span>Renter</span
                ><strong>{{ profileName() }} · age {{ form.controls.renterAge.value }}</strong>
              </div>
              <div><span>Payment</span><strong>Pay at pickup</strong></div>
            </div>
            <app-price-breakdown *ngIf="preview() as p" [preview]="p" />
            <p class="secure-note">No payment gateway is connected. Your booking will begin as Pending.</p>
          </section>
        </form>
        <div class="wizard-actions">
          <ion-button fill="clear" *ngIf="step() > 1" (click)="back()">Back</ion-button
          ><ion-button size="large" (click)="next()" [disabled]="busy() || calculating()"
            ><ion-spinner *ngIf="busy()" slot="start" name="crescent" />{{
              busy()
                ? 'Submitting…'
                : calculating()
                  ? 'Checking price…'
                  : step() === 4
                    ? 'Confirm reservation'
                    : 'Continue'
            }}</ion-button
          >
        </div>
      </div>
      <ion-toast
        [isOpen]="!!error()"
        [message]="error()"
        color="danger"
        [duration]="2600"
        (didDismiss)="error.set('')"
    /></ion-content>`,
})
export class ReservationPage implements OnInit {
  readonly today = isoToday();
  readonly step = signal(1);
  readonly vehicle = signal<Vehicle | null>(null);
  readonly preview = signal<BookingPricePreview | null>(null);
  readonly error = signal('');
  readonly busy = signal(false);
  readonly calculating = signal(false);
  readonly vehicleLoading = signal(true);
  readonly vehicleError = signal('');
  readonly licenseName = signal('');
  readonly licenseFile = signal<File | null>(null);
  readonly profileName = signal('Customer');
  money = peso;
  readonly form = this.fb.nonNullable.group(
    {
      pickupDate: [this.today, Validators.required],
      returnDate: [this.today, Validators.required],
      contactNumber: ['', [Validators.required, Validators.minLength(7)]],
      renterAge: [18, [Validators.required, Validators.min(18)]],
      voucherCode: [''],
    },
    { validators: dateRangeValidator },
  );
  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly vehicles: VehicleService,
    private readonly bookings: BookingService,
    private readonly profile: ProfileService,
    private readonly media: MediaService,
    private readonly alerts: AlertController,
  ) {
    addIcons({ checkmarkCircleOutline, documentAttachOutline });
  }
  ngOnInit(): void {
    this.loadVehicle();
    this.profile.get().subscribe((p) => {
      this.profileName.set(p.fullName);
      this.form.patchValue({ contactNumber: p.phone });
    });
  }
  loadVehicle(): void {
    this.vehicleLoading.set(true);
    this.vehicleError.set('');
    this.vehicles.getById(this.route.snapshot.paramMap.get('id') || '').subscribe({
      next: (vehicle) => {
        this.vehicle.set(vehicle);
        this.vehicleLoading.set(false);
      },
      error: () => {
        this.vehicle.set(null);
        this.vehicleError.set('Check your connection and try again.');
        this.vehicleLoading.set(false);
      },
    });
  }
  pickLicense(): void {
    this.media.pickImage('license').subscribe({
      next: (value) => {
        this.licenseName.set(value?.name || '');
        this.licenseFile.set(value?.file ?? null);
      },
      error: (error: unknown) =>
        this.error.set(error instanceof Error ? error.message : 'Could not select this image.'),
    });
  }
  back(): void {
    this.step.update((v) => Math.max(1, v - 1));
  }
  next(): void {
    if (this.step() === 1) {
      this.step.set(2);
      return;
    }
    if (this.step() === 2) {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      this.calculate(() => this.step.set(3));
      return;
    }
    if (this.step() === 3) {
      this.calculate(() => this.step.set(4));
      return;
    }
    void this.confirm();
  }
  calculate(done?: () => void): void {
    const v = this.vehicle();
    if (!v || this.calculating()) return;
    this.calculating.set(true);
    this.bookings
      .preview({
        vehicleId: v.id,
        pickupDate: this.form.controls.pickupDate.value,
        returnDate: this.form.controls.returnDate.value,
        voucherCode: this.form.controls.voucherCode.value || undefined,
      })
      .subscribe({
        next: (p) => {
          this.preview.set(p);
          done?.();
          this.calculating.set(false);
        },
        error: (e) => {
          this.error.set(e instanceof Error ? e.message : 'Could not calculate price.');
          this.calculating.set(false);
        },
      });
  }
  private async confirm(): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Confirm reservation?',
      message: 'This creates a pending booking. Payment will be collected by PMS staff at pickup.',
      buttons: [
        { text: 'Not yet', role: 'cancel' },
        { text: 'Confirm', role: 'confirm' },
      ],
    });
    await alert.present();
    const result = await alert.onDidDismiss();
    if (result.role !== 'confirm') return;
    const v = this.vehicle();
    if (!v) return;
    this.busy.set(true);
    this.bookings
      .create({
        vehicleId: v.id,
        pickupDate: this.form.controls.pickupDate.value,
        returnDate: this.form.controls.returnDate.value,
        contactNumber: this.form.controls.contactNumber.value,
        renterAge: this.form.controls.renterAge.value,
        voucherCode: this.form.controls.voucherCode.value || undefined,
        licenseFileName: this.licenseName() || undefined,
      })
      .pipe(
        switchMap((booking) => {
          const file = this.licenseFile();
          return file
            ? this.media.uploadLicense(booking.id, file).pipe(
                map(() => ({ booking, licenseUploadFailed: false })),
                catchError(() => of({ booking, licenseUploadFailed: true })),
              )
            : of({ booking, licenseUploadFailed: false });
        }),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: ({ booking, licenseUploadFailed }) =>
          void this.router.navigate(['/booking', booking.id], {
            queryParams: { created: true, licenseUploadFailed: licenseUploadFailed || null },
            replaceUrl: true,
          }),
        error: (e) => this.error.set(e instanceof Error ? e.message : 'Booking failed.'),
      });
  }
}
