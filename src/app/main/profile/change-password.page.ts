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
import { finalize } from 'rxjs';
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
        <app-password-input
          label="Current password"
          formControlName="current"
          autocomplete="current-password"
          enterKeyHint="next"
        /><app-password-input
          label="New password"
          formControlName="password"
          autocomplete="new-password"
          enterKeyHint="next"
        /><app-password-input
          label="Confirm new password"
          formControlName="confirm"
          autocomplete="new-password"
        /><ion-button
          expand="block"
          size="large"
          type="submit"
          [disabled]="busy() || form.invalid || form.value.password !== form.value.confirm"
          >{{ busy() ? 'Updating…' : 'Update password' }}</ion-button
        >
      </form>
      <ion-toast
        [isOpen]="!!message()"
        [message]="message()"
        [color]="messageColor()"
        [duration]="2200"
        (didDismiss)="message.set('')"
    /></ion-content>`,
})
export class ChangePasswordPage {
  readonly busy = signal(false);
  readonly message = signal('');
  readonly messageColor = signal<'success' | 'danger'>('success');
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
    if (this.busy() || this.form.invalid || v.password !== v.confirm) return;
    this.busy.set(true);
    this.auth
      .changePassword(v.current, v.password)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.messageColor.set('success');
          this.message.set('Password changed successfully.');
          this.form.reset();
        },
        error: (error: unknown) => {
          this.messageColor.set('danger');
          this.message.set(error instanceof Error ? error.message : 'Could not change the password.');
        },
      });
  }
}
