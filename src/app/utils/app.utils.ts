import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export const peso = (value: number): string =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(
    value,
  );
export const isoToday = (): string => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
export const rentalDays = (pickup: string, returns: string): number => {
  const difference = Math.floor((Date.parse(returns) - Date.parse(pickup)) / 86400000);
  return difference < 0 ? 0 : Math.max(1, difference);
};
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };
export const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const pickup = control.get('pickupDate')?.value as string;
  const returns = control.get('returnDate')?.value as string;
  if (!pickup || !returns) return null;
  return returns < pickup ? { dateRange: true } : pickup < isoToday() ? { pastDate: true } : null;
};
