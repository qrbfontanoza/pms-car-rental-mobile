import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonToast,
} from '@ionic/angular/standalone';
import { AuthService } from '../../models/service.interfaces';
import { PasswordInputComponent } from '../../shared/password-input.component';
@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonToast,
    PasswordInputComponent,
  ],
  template: `<ion-header class="ion-no-border"
      ><ion-toolbar
        ><ion-buttons slot="start"><ion-back-button defaultHref="/tabs/profile" /></ion-buttons
        ><ion-title>Change password</ion-title></ion-toolbar
      ></ion-header
    ><ion-content
      ><form class="form-shell" [formGroup]="form" (ngSubmit)="save()">
        <h1>Protect your account</h1>
        <p>Passwords must contain at least six characters.</p>
        <app-password-input label="Current password" formControlName="current" /><app-password-input
          label="New password"
          formControlName="password"
        /><app-password-input label="Confirm new password" formControlName="confirm" /><ion-button
          expand="block"
          size="large"
          type="submit"
          [disabled]="form.invalid || form.value.password !== form.value.confirm"
          >Update password</ion-button
        >
      </form>
      <ion-toast [isOpen]="saved()" message="Password changed in mock mode." [duration]="2200"
    /></ion-content>`,
})
export class ChangePasswordPage {
  readonly saved = signal(false);
  readonly form = this.fb.nonNullable.group({
    current: ['', [Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  });
  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
  ) {}
  save(): void {
    const v = this.form.getRawValue();
    if (this.form.invalid || v.password !== v.confirm) return;
    this.auth.changePassword(v.current, v.password).subscribe(() => {
      this.saved.set(true);
      this.form.reset();
    });
  }
}
