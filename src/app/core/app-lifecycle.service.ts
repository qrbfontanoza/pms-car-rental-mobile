import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { AuthService, BookingService } from '../models/service.interfaces';

@Injectable({ providedIn: 'root' })
export class AppLifecycleService {
  constructor(auth: AuthService, bookings: BookingService) {
    auth.user$.subscribe((user) => {
      if (!user) bookings.clear();
    });
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive && auth.isAuthenticated) bookings.list().subscribe({ error: () => undefined });
    });
  }
}
