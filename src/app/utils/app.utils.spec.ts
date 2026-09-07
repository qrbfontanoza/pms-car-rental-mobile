import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator, passwordMatchValidator, rentalDays } from './app.utils';
describe('app validation and pricing utilities', () => {
  it('matches the website rental-day calculation', () => {
    expect(rentalDays('2026-09-01', '2026-09-01')).toBe(1);
    expect(rentalDays('2026-09-01', '2026-09-03')).toBe(2);
  });
  it('rejects a return before pickup', () => {
    const form = new FormGroup({
      pickupDate: new FormControl('2099-09-03'),
      returnDate: new FormControl('2099-09-01'),
    });
    expect(dateRangeValidator(form)).toEqual({ dateRange: true });
  });
  it('requires matching passwords', () => {
    const form = new FormGroup({
      password: new FormControl('secret1'),
      confirmPassword: new FormControl('secret2'),
    });
    expect(passwordMatchValidator(form)).toEqual({ passwordMismatch: true });
  });
});
