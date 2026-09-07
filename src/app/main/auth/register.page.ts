import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, map, of, switchMap } from 'rxjs';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { AuthService, MediaService } from '../../models/service.interfaces';
import { PasswordInputComponent } from '../../shared/password-input.component';
import { passwordMatchValidator } from '../../utils/app.utils';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonSpinner,
    IonButton,
    IonCheckbox,
    IonText,
    IonToast,
    PasswordInputComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/auth/login" /></ion-buttons
        ><ion-title>Create account</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><div class="auth-shell">
        <h1>Let’s get you moving</h1>
        <p>Create your PMS Car Rental customer account.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-input
            label="Full name"
            labelPlacement="stacked"
            autocomplete="name"
            formControlName="fullName"
          /><ion-text color="danger" *ngIf="bad('fullName')">Full name is required.</ion-text
          ><ion-input
            label="Email"
            labelPlacement="stacked"
            type="email"
            autocomplete="email"
            formControlName="email"
          /><ion-text color="danger" *ngIf="bad('email')">Enter a valid email.</ion-text
          ><app-password-input
            label="Password"
            formControlName="password"
            autocomplete="new-password"
            enterKeyHint="next"
          /><ion-text color="danger" *ngIf="form.controls.password.touched && form.controls.password.invalid"
            >Password must be at least 6 characters.</ion-text
          ><app-password-input
            label="Confirm password"
            formControlName="confirmPassword"
            autocomplete="new-password"
          /><ion-text color="danger" *ngIf="form.touched && form.hasError('passwordMismatch')"
            >Passwords must match.</ion-text
          ><button type="button" class="image-picker" (click)="pickLicense()">
            <span>{{ licenseName() || 'Optional driver’s-license image' }}</span
            ><strong>{{ licenseName() ? 'Change' : 'Choose JPG or PNG' }}</strong></button
          ><small>Maximum 3 MB. JPEG and PNG images only.</small
          ><ion-checkbox formControlName="privacyConsent"
            >I agree to the <a routerLink="/more/privacy">Privacy Policy</a>.</ion-checkbox
          ><ion-text color="danger" *ngIf="bad('privacyConsent')">Privacy consent is required.</ion-text
          ><ion-button expand="block" size="large" type="submit" [disabled]="form.invalid || busy()"
            ><ion-spinner *ngIf="busy()" slot="start" name="crescent" />{{
              busy() ? 'Creating account…' : 'Create account'
            }}</ion-button
          >
        </form>
        <p class="auth-switch">Already registered? <a routerLink="/auth/login">Sign in</a></p>
      </div>
      <ion-toast
        [isOpen]="!!error()"
        [message]="error()"
        color="danger"
        [duration]="2500"
        aria-live="assertive"
    /></ion-content>`,
})
export class RegisterPage {
  readonly busy = signal(false);
  readonly error = signal('');
  readonly licenseName = signal('');
  readonly licenseFile = signal<File | null>(null);
  readonly form = this.fb.nonNullable.group(
    {
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      privacyConsent: [false, Validators.requiredTrue],
    },
    { validators: passwordMatchValidator },
  );
  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly media: MediaService,
    private readonly router: Router,
  ) {}
  bad(key: 'fullName' | 'email' | 'privacyConsent'): boolean {
    const c = this.form.controls[key];
    return c.touched && c.invalid;
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
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    const { confirmPassword, ...value } = this.form.getRawValue();
    this.auth
      .register({ ...value, licenseFileName: this.licenseName() || undefined })
      .pipe(
        switchMap((user) => {
          const file = this.licenseFile();
          return file ? this.media.uploadProfileLicense(file).pipe(map(() => user)) : of(user);
        }),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/tabs/home', { replaceUrl: true }),
        error: (e) => {
          this.error.set(e instanceof Error ? e.message : 'Registration failed.');
        },
      });
  }
}
