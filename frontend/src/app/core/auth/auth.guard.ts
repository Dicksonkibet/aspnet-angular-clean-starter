import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/// Guard for any route that needs a logged-in user. Unauthenticated visitors are
/// redirected to /login instead of seeing the protected page render (even briefly).
/// Apply with `canActivate: [authGuard]` on the route.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
