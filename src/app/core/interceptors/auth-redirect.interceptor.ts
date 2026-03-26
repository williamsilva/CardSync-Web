import {
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { API } from '../api/api.config';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../auth/session.service';

function isCardsync(url: string): boolean {
  if (url.startsWith(API.bffBaseUrl) || url.startsWith(API.apiBaseUrl)) return true;
  return url.startsWith('/bff/') || url === '/bff' || url.startsWith('/api/') || url === '/api';
}

function isPublicSpaRoute(path: string): boolean {
  return path.startsWith('/public') || path.startsWith('/error');
}

function canTriggerLoginNow(): boolean {
  const key = 'cs_login_redirect_lock';
  const now = Date.now();
  const last = Number(sessionStorage.getItem(key) ?? '0');

  if (now - last < 3000) return false;

  sessionStorage.setItem(key, String(now));
  return true;
}

export const authRedirectInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const session = inject(SessionService);

  if (!isCardsync(req.url)) return next(req);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        return throwError(() => err);
      }

      if (err.status !== 401 && err.status !== 403) {
        return throwError(() => err);
      }

      const currentPath = router.url || '/';

      if (isPublicSpaRoute(currentPath)) {
        return throwError(() => err);
      }

      // 403 com sessão válida = sem permissão; não deve relogar
      if (err.status === 403 && auth.isAuthenticated()) {
        return throwError(() => err);
      }

      const ignored =
        req.url.includes('/bff/me') ||
        req.url.includes('/bff/csrf') ||
        req.url.includes('/bff/logout') ||
        req.url.includes('/bff/login/prepare');

      if (ignored) {
        return throwError(() => err);
      }

      session.stop();

      if (!canTriggerLoginNow()) {
        return throwError(() => err);
      }

      return from(auth.startLogin(currentPath)).pipe(switchMap(() => throwError(() => err)));
    }),
  );
};
