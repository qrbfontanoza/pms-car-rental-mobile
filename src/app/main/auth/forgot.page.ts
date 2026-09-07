import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { AuthService } from '../../models/service.interfaces';
import { PasswordInputComponent } from '../../shared/password-input.component';
import { Observable, finalize } from 'rxjs';
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
    IonButton,
    IonToast,
    PasswordInputComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/auth/login" /></ion-buttons
        ><ion-title>Reset password</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><div class="auth-shell">
        <p class="eyebrow">STEP {{ step() }} OF 3</p>
        <h1>{{ titles[step() - 1] }}</h1>
        <p>{{ descriptions[step() - 1] }}</p>
        <form [formGroup]="form" (ngSubmit)="next()">
          <ion-input
            *ngIf="step() === 1"
            label="Email"
            labelPlacement="stacked"
            type="email"
            autocomplete="email"
            formControlName="email"
          /><ion-input
            *ngIf="step() === 2"
            label="Six-digit code"
            labelPlacement="stacked"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            formControlName="code"
          /><app-password-input
            *ngIf="step() === 3"
            label="New password"
            formControlName="password"
            autocomplete="new-password"
          /><ion-button expand="block" size="large" type="submit" [disabled]="busy()">{{
            busy() ? 'Please wait…' : step() === 3 ? 'Reset password' : 'Continue'
          }}</ion-button>
        </form>
        <p class="auth-switch"><a routerLink="/auth/login">Back to sign in</a></p>
      </div>
      <ion-toast
        [isOpen]="!!message()"
        [message]="message()"
        [color]="messageColor()"
        [duration]="2500"
        (didDismiss)="message.set('')"
    /></ion-content>`,
})
export class ForgotPage {
  readonly step = signal(1);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly messageColor = signal<'success' | 'danger'>('success');
  readonly titles = ['Find your account', 'Enter reset code', 'Choose a new password'];
  readonly descriptions = [
    'If the email is registered, we’ll send a six-digit reset code.',
    'Enter the six-digit code sent to you.',
    'Use at least six characters.',
  ];
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}
  next(): void {
    if (this.busy()) return;
    if (this.step() === 1) {
      if (this.form.controls.email.invalid) {
        this.form.controls.email.markAsTouched();
        return;
      }
      this.run(this.auth.forgotPassword(this.form.controls.email.value), () => this.step.set(2));
    } else if (this.step() === 2) {
      if (this.form.controls.code.invalid) return;
      this.run(
        this.auth.verifyResetCode(this.form.controls.email.value, this.form.controls.code.value),
        (ok) => ok && this.step.set(3),
      );
    } else {
      if (this.form.controls.password.invalid) return;
      this.run(
        this.auth.resetPassword(
          this.form.controls.email.value,
          this.form.controls.code.value,
          this.form.controls.password.value,
        ),
        () => {
          this.messageColor.set('success');
          this.message.set('Password reset. You can now sign in.');
          setTimeout(() => void this.router.navigateByUrl('/auth/login'), 1000);
        },
      );
    }
  }
  private run<T>(request: Observable<T>, success: (value: T) => void): void {
    this.busy.set(true);
    this.message.set('');
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: success,
      error: (error: unknown) => {
        this.messageColor.set('danger');
        this.message.set(error instanceof Error ? error.message : 'The request could not be completed.');
      },
    });
  }
}
