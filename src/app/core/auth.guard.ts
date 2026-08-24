import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../models/service.interfaces';
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService),
    router = inject(Router);
  return (
    auth.isAuthenticated || router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } })
  );
};
