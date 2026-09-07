import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { ThemeService } from '../../core/theme.service';
import { CustomerProfile, User } from '../../models/domain.models';
import { AuthService, BookingService, ProfileService } from '../../models/service.interfaces';
import { ProfilePage } from './profile.page';

describe('ProfilePage', () => {
  const user: User = {
    id: '47',
    fullName: 'Mobile Staging Customer',
    email: 'mobile-test@pms-staging.local',
    licenseStatus: 'not_uploaded',
  };
  const profile: CustomerProfile = {
    ...user,
    phone: '',
    notifications: { bookingUpdates: true, promotions: false, reminders: true },
  };

  const createPage = (profileResponse: Observable<CustomerProfile>) => {
    const userSubject = new BehaviorSubject<User | null>(null);
    const auth = {
      user$: userSubject.asObservable(),
      ready$: of(true),
      get isAuthenticated() {
        return userSubject.value !== null;
      },
      logout: () => of(undefined),
    } as unknown as AuthService;
    const profiles = { get: () => profileResponse } as unknown as ProfileService;
    const theme = {
      preference: signal<'light' | 'dark' | 'system'>('light'),
      set: () => undefined,
    } as unknown as ThemeService;
    const router = { navigateByUrl: () => Promise.resolve(true) } as unknown as Router;
    const bookings = { clear: () => undefined } as unknown as BookingService;
    const page = new ProfilePage(auth, theme, profiles, bookings, router);
    page.ngOnInit();
    return { page, userSubject };
  };

  it('switches from guest to authenticated as soon as login state changes', () => {
    const profileSubject = new Subject<CustomerProfile>();
    const { page, userSubject } = createPage(profileSubject);
    expect(page.authenticated()).toBeFalse();

    userSubject.next(user);

    expect(page.authenticated()).toBeTrue();
    expect(page.profileLoading()).toBeTrue();
    expect(page.profile()).toBeNull();
    page.ngOnDestroy();
  });

  it('loads the customer profile after login', () => {
    const { page, userSubject } = createPage(of(profile));
    userSubject.next(user);

    expect(page.authenticated()).toBeTrue();
    expect(page.profile()).toEqual(profile);
    expect(page.profileLoading()).toBeFalse();
    page.ngOnDestroy();
  });
});
