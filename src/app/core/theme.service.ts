import { Injectable, signal } from '@angular/core';
import { ThemePreference } from '../models/domain.models';
import { StorageService } from './storage.service';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>('system');
  private readonly key = 'pms.theme';
  private readonly systemTheme = matchMedia('(prefers-color-scheme: dark)');
  constructor(private readonly storage: StorageService) {
    this.set(this.storage.get(this.key, 'system'));
    this.systemTheme.addEventListener('change', () => {
      if (this.preference() === 'system') this.applyTheme('system');
    });
  }
  set(value: ThemePreference): void {
    this.preference.set(value);
    this.storage.set(this.key, value);
    this.applyTheme(value);
  }
  private applyTheme(value: ThemePreference): void {
    const dark = value === 'dark' || (value === 'system' && this.systemTheme.matches);
    document.documentElement.classList.toggle('ion-palette-dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }
}
