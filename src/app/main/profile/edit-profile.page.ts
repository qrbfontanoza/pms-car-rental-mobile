import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonTitle,
  IonToggle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { CustomerProfile } from '../../models/domain.models';
import { MediaService, ProfileService } from '../../models/service.interfaces';
import { concatMap, finalize, of } from 'rxjs';
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
    IonAvatar,
    IonInput,
    IonButton,
    IonItem,
    IonToggle,
    IonToast,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/profile" /></ion-buttons
        ><ion-title>Edit profile</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><div class="form-shell">
        <div class="photo-picker">
          <ion-avatar
            ><img [src]="image() || 'assets/profile-placeholder.svg'" alt="Profile photo" /></ion-avatar
          ><ion-button fill="outline" type="button" (click)="pick()">Change photo</ion-button>
        </div>
        <section class="document-picker">
          <h2>Rental documents</h2>
          <p>{{ licenseHelp() }}</p>
          <button type="button" class="image-picker" (click)="pickLicense()" [disabled]="saving()">
            <span>{{ licenseName() || 'Driver’s-license image' }}</span>
            <strong>{{ licenseName() ? 'Selected' : licenseActionLabel() }}</strong>
          </button>
          <small>Maximum 3 MB. JPEG and PNG images only. Uploading sends it for staff verification.</small>
        </section>
        <form [formGroup]="form" (ngSubmit)="save()">
          <ion-input label="Full name" labelPlacement="stacked" formControlName="fullName" /><ion-input
            label="Email"
            labelPlacement="stacked"
            type="email"
            formControlName="email"
          /><ion-input label="Phone" labelPlacement="stacked" inputmode="tel" formControlName="phone" />
          <h2>Notifications</h2>
          <ion-item><ion-toggle formControlName="bookingUpdates">Booking updates</ion-toggle></ion-item
          ><ion-item><ion-toggle formControlName="reminders">Pickup reminders</ion-toggle></ion-item
          ><ion-item><ion-toggle formControlName="promotions">Offers and promotions</ion-toggle></ion-item
          ><ion-button expand="block" size="large" type="submit" [disabled]="form.invalid || saving()">{{
            saving() ? 'Saving…' : 'Save changes'
          }}</ion-button>
        </form>
      </div>
      <ion-toast
        [isOpen]="!!toastMessage()"
        [message]="toastMessage()"
        [color]="toastColor()"
        [duration]="2000"
        (didDismiss)="toastMessage.set('')"
    /></ion-content>`,
})
export class EditProfilePage implements OnInit, OnDestroy {
  readonly image = signal('');
  readonly saving = signal(false);
  readonly toastMessage = signal('');
  readonly toastColor = signal<'success' | 'danger'>('success');
  readonly licenseName = signal('');
  readonly licenseStatus = signal<CustomerProfile['licenseStatus']>('not_uploaded');
  private current?: CustomerProfile;
  private selectedPhoto: File | null = null;
  private selectedLicense: File | null = null;
  private objectUrl: string | null = null;
  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    bookingUpdates: [true],
    reminders: [true],
    promotions: [false],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly profiles: ProfileService,
    private readonly media: MediaService,
  ) {}
  ngOnInit(): void {
    this.profiles.get().subscribe((p) => {
      this.current = p;
      this.image.set(p.profileImage || '');
      this.licenseStatus.set(p.licenseStatus);
      this.form.patchValue({ ...p, ...p.notifications });
    });
  }
  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }
  pick(): void {
    this.media.pickImage('profile').subscribe({
      next: (value) => {
        if (!value) return;
        if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
        this.selectedPhoto = value.file ?? null;
        this.objectUrl = value.previewUrl.startsWith('blob:') ? value.previewUrl : null;
        this.image.set(value.previewUrl);
      },
      error: (error: unknown) => this.showError(error),
    });
  }
  pickLicense(): void {
    this.media.pickImage('license').subscribe({
      next: (value) => {
        if (!value?.file) return;
        this.selectedLicense = value.file;
        this.licenseName.set(value.name);
      },
      error: (error: unknown) => this.showError(error),
    });
  }
  licenseActionLabel(): string {
    return this.licenseStatus() === 'not_uploaded' ? 'Choose JPG or PNG' : 'Replace image';
  }
  licenseHelp(): string {
    if (this.licenseName()) return 'The selected image will be uploaded when you save changes.';
    if (this.licenseStatus() === 'verified') return 'Verified and ready for rentals.';
    if (this.licenseStatus() === 'pending') return 'Verification is pending.';
    if (this.licenseStatus() === 'rejected') return 'The previous image was rejected. Upload a clearer image.';
    return 'No driver’s license has been uploaded.';
  }
  save(): void {
    if (this.form.invalid || !this.current || this.saving()) return;
    const v = this.form.getRawValue();
    const notifications = {
      bookingUpdates: v.bookingUpdates,
      reminders: v.reminders,
      promotions: v.promotions,
    };
    this.saving.set(true);
    this.profiles
      .update({
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
      })
      .pipe(
        concatMap(() => this.profiles.updateNotifications(notifications)),
        concatMap((profile) =>
          this.selectedPhoto ? this.media.uploadProfilePhoto(this.selectedPhoto) : of(profile),
        ),
        concatMap((profile) =>
          this.selectedLicense ? this.media.uploadProfileLicense(this.selectedLicense) : of(profile),
        ),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (profile) => {
          this.current = profile;
          this.selectedPhoto = null;
          this.selectedLicense = null;
          this.licenseName.set('');
          this.licenseStatus.set(profile.licenseStatus);
          if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
          this.objectUrl = null;
          this.image.set(profile.profileImage || '');
          this.toastColor.set('success');
          this.toastMessage.set('Profile and notification settings updated.');
        },
        error: (error: unknown) => this.showError(error),
      });
  }

  private showError(error: unknown): void {
    this.toastColor.set('danger');
    this.toastMessage.set(error instanceof Error ? error.message : 'Could not update your profile.');
  }
}
