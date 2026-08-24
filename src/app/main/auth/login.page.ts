import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonText,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { AuthService } from '../../models/service.interfaces';
import { PasswordInputComponent } from '../../shared/password-input.component';
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
    IonContent,
    IonInput,
    IonButton,
    IonText,
    IonToast,
    PasswordInputComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"
          ><ion-back-button defaultHref="/tabs/home" /></ion-buttons></ion-toolbar></ion-header
    ><ion-content
      ><div class="auth-shell">
        <img src="assets/logo.png" alt="PMS Car Rental" />
        <p class="eyebrow">WELCOME BACK</p>
        <h1>Sign in to continue</h1>
        <p>Manage bookings, receipts, and your rental profile.</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <ion-input
            label="Email"
            labelPlacement="stacked"
            type="email"
            autocomplete="email"
            formControlName="email"
          /><ion-text color="danger" *ngIf="form.controls.email.touched && form.controls.email.invalid"
            >Enter a valid email.</ion-text
          ><app-password-input formControlName="password" /><ion-text
            color="danger"
            *ngIf="form.controls.password.touched && form.controls.password.invalid"
            >Password must be at least 6 characters.</ion-text
          >
          <div class="form-link"><a routerLink="/auth/forgot">Forgot password?</a></div>
          <ion-button expand="block" size="large" type="submit" [disabled]="form.invalid || busy()">{{
            busy() ? 'Signing in…' : 'Sign in'
          }}</ion-button>
        </form>
        <p class="auth-switch">New to PMS? <a routerLink="/auth/register">Create an account</a></p>
        <div class="demo-note">
          <strong>Mock mode</strong>
          <p>Use any valid email and a password of 6+ characters.</p>
        </div>
      </div>
      <ion-toast
        [isOpen]="!!error()"
        [message]="error()"
        color="danger"
        [duration]="2500"
        (didDismiss)="error.set('')"
    /></ion-content>`,
})
export class LoginPage {
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    email: ['maria@pmsrentals.ph', [Validators.required, Validators.email]],
    password: ['demo123', [Validators.required, Validators.minLength(6)]],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}
  submit(): void {
    if (this.form.invalid) return;
    this.busy.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () =>
        void this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/tabs/home', {
          replaceUrl: true,
        }),
      error: (e) => {
        this.error.set(e instanceof Error ? e.message : 'Unable to sign in.');
        this.busy.set(false);
      },
    });
  }
}
