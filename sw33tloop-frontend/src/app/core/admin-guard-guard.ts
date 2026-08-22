import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
  }

  if (!auth.isAdmin()) {
    return router.createUrlTree(['/']);
  }

  return true;
};
