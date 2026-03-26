import { inject } from '@angular/core';
import { CanActivateFn, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);

  const ok = await auth.ensureSessionChecked();
  if (ok) return true;

  await auth.startLogin(state.url);
  return false;
};
