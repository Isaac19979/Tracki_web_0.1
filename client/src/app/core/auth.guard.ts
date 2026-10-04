import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Solo usuarios con sesión iniciada. */
export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await inject(AuthService).currentUser()) ? true : router.parseUrl('/login');
};

/** Solo usuarios sin sesión (página de login). */
export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await inject(AuthService).currentUser()) ? router.parseUrl('/') : true;
};
