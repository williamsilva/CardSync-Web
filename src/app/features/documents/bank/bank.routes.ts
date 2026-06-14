import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const BANK_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'bank_statement' },
  {
    path: 'bank_statement',
    title: 'routes.transactions.bankStatement.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.BANKS.BANK_STATEMENT],
    },
    loadComponent: () =>
      import('./bank-statement/bank-statement-list.component').then(
        (m) => m.BankStatementListComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
