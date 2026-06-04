import { inject } from '@angular/core';
import { CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const ok = await auth.ensureSessionChecked();
  if (!ok) {
    await auth.startLogin(state.url);
    return false;
  }

  const returnUrl = auth.consumeReturnUrl();
  if (returnUrl && returnUrl !== state.url) {
    return router.parseUrl(returnUrl);
  }

  return true;
};
