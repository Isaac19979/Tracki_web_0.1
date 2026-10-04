import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** Añade el token de Firebase y la zona horaria del usuario a las llamadas a la API. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  return from(inject(AuthService).token()).pipe(
    switchMap((token) => {
      const headers: Record<string, string> = {
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return next(req.clone({ setHeaders: headers }));
    }),
  );
};
