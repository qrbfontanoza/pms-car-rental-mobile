import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../models/service.interfaces';
import { filter, map, take } from 'rxjs';
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService),
    router = inject(Router);
  return auth.ready$.pipe(
    filter(Boolean),
    take(1),
    map(() =>
      auth.isAuthenticated
        ? true
        : router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } }),
    ),
  );
};
