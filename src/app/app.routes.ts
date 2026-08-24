import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'splash' },
  { path: 'splash', loadComponent: () => import('./features/splash/splash.page').then((m) => m.SplashPage) },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/splash/onboarding.page').then((m) => m.OnboardingPage),
  },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  {
    path: 'tabs',
    loadComponent: () => import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'home', loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage) },
      {
        path: 'vehicles',
        loadComponent: () => import('./features/vehicles/vehicles.page').then((m) => m.VehiclesPage),
      },
      {
        path: 'bookings',
        canActivate: [authGuard],
        loadComponent: () => import('./features/bookings/bookings.page').then((m) => m.BookingsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  {
    path: 'vehicles/:id',
    loadComponent: () => import('./features/vehicles/vehicle-details.page').then((m) => m.VehicleDetailsPage),
  },
  {
    path: 'reserve/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/booking-flow/reservation.page').then((m) => m.ReservationPage),
  },
  {
    path: 'booking/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/booking-details.page').then((m) => m.BookingDetailsPage),
  },
  {
    path: 'receipt/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/receipt.page').then((m) => m.ReceiptPage),
  },
  {
    path: 'profile/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/edit-profile.page').then((m) => m.EditProfilePage),
  },
  {
    path: 'profile/change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/change-password.page').then((m) => m.ChangePasswordPage),
  },
  { path: 'more/:page', loadComponent: () => import('./features/more/more.page').then((m) => m.MorePage) },
  { path: '**', redirectTo: 'tabs/home' },
];
