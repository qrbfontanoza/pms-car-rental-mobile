import { Routes } from '@angular/router';
export const AUTH_ROUTES: Routes = [
  { path: 'login', loadComponent: () => import('./login.page').then((m) => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./register.page').then((m) => m.RegisterPage) },
  { path: 'forgot', loadComponent: () => import('./forgot.page').then((m) => m.ForgotPage) },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
