import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [IonInput, IonButton, IonIcon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PasswordInputComponent), multi: true },
  ],
  template: `<div class="password-input">
    <ion-input
      [type]="visible() ? 'text' : 'password'"
      [label]="label()"
      labelPlacement="stacked"
      [autocomplete]="autocomplete()"
      [enterkeyhint]="enterKeyHint()"
      [value]="value"
      (ionInput)="change($any($event.target).value || '')"
      (ionBlur)="touch()"
    /><ion-button
      fill="clear"
      type="button"
      (click)="visible.update((v) => !v)"
      [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
      ><ion-icon [name]="visible() ? 'eye-off-outline' : 'eye-outline'"
    /></ion-button>
  </div>`,
})
export class PasswordInputComponent implements ControlValueAccessor {
  label = input('Password');
  autocomplete = input<'current-password' | 'new-password'>('current-password');
  enterKeyHint = input<'next' | 'done'>('done');
  visible = signal(false);
  value = '';
  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};
  constructor() {
    addIcons({ eyeOffOutline, eyeOutline });
  }
  writeValue(v: string): void {
    this.value = v || '';
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  change(v: string): void {
    this.value = v;
    this.onChange(v);
  }
  touch(): void {
    this.onTouched();
  }
}
