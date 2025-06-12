import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const viewResultGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  const encodedUser = cookieService.get('userdetails');
  if (encodedUser) {
    // User is logged in, allow access
    return true;
  } else {
    // Save the attempted URL (including query params) before redirecting
    sessionStorage.setItem('redirectUrl', state.url);
    router.navigate(['/login']);
    return false;
  }
};
