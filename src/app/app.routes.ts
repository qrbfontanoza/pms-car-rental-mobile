import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'splash' },
  { path: 'splash', loadComponent: () => import('./main/splash/splash.page').then((m) => m.SplashPage) },
  {
    path: 'onboarding',
    loadComponent: () => import('./main/splash/onboarding.page').then((m) => m.OnboardingPage),
  },
  { path: 'auth', loadChildren: () => import('./main/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  {
    path: 'tabs',
    loadComponent: () => import('./main/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'home', loadComponent: () => import('./main/home/home.page').then((m) => m.HomePage) },
      {
        path: 'vehicles',
        loadComponent: () => import('./main/vehicles/vehicles.page').then((m) => m.VehiclesPage),
      },
      {
        path: 'bookings',
        canActivate: [authGuard],
        loadComponent: () => import('./main/bookings/bookings.page').then((m) => m.BookingsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./main/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  {
    path: 'vehicles/:id',
    loadComponent: () => import('./main/vehicles/vehicle-details.page').then((m) => m.VehicleDetailsPage),
  },
  {
    path: 'reserve/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./main/booking-flow/reservation.page').then((m) => m.ReservationPage),
  },
  {
    path: 'booking/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./main/bookings/booking-details.page').then((m) => m.BookingDetailsPage),
  },
  {
    path: 'receipt/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./main/bookings/receipt.page').then((m) => m.ReceiptPage),
  },
  {
    path: 'profile/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./main/profile/edit-profile.page').then((m) => m.EditProfilePage),
  },
  {
    path: 'profile/change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./main/profile/change-password.page').then((m) => m.ChangePasswordPage),
  },
  { path: 'more/:page', loadComponent: () => import('./main/more/more.page').then((m) => m.MorePage) },
  { path: '**', redirectTo: 'tabs/home' },
];
