import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
          <ion-avatar><img [src]="image() || 'assets/avatar.png'" alt="Profile photo" /></ion-avatar
          ><ion-button fill="outline" (click)="pick()">Change photo</ion-button>
        </div>
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
          ><ion-button expand="block" size="large" type="submit" [disabled]="form.invalid"
            >Save changes</ion-button
          >
        </form>
      </div>
      <ion-toast
        [isOpen]="saved()"
        message="Profile updated."
        [duration]="2000"
        (didDismiss)="saved.set(false)"
    /></ion-content>`,
})
export class EditProfilePage implements OnInit {
  readonly image = signal('');
  readonly saved = signal(false);
  private current?: CustomerProfile;
  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
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
      this.form.patchValue({ ...p, ...p.notifications });
    });
  }
  pick(): void {
    this.media.pickImage('profile').subscribe((v) => v && this.image.set(v.previewUrl));
  }
  save(): void {
    if (this.form.invalid || !this.current) return;
    const v = this.form.getRawValue();
    this.profiles
      .update({
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        profileImage: this.image(),
        notifications: { bookingUpdates: v.bookingUpdates, reminders: v.reminders, promotions: v.promotions },
      })
      .subscribe(() => this.saved.set(true));
  }
}
