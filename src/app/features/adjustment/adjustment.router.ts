import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

const defaultPermissions = [
  PERMISSIONS.SUPPORT,
  PERMISSIONS.COMPANIES.VIEW,
  PERMISSIONS.ACQUIRER.VIEW,
];

export const ADJUSTMENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tariffs' },

  {
    path: 'chargeback-requests',
    title: 'routes.adjustment.chargebackRequests.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./chargeback-request-list/chargeback-request-list.component').then(
        (m) => m.ChargebackRequestListComponent,
      ),
  },

  {
    path: 'cancellation',
    title: 'routes.adjustment.cancellation.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./cancellation-list/cancellation-list.component').then(
        (m) => m.CancellationListComponent,
      ),
  },

  {
    path: 'tariffs',
    canActivate: [permissionGuard],
    title: 'routes.adjustment.tariffs.title',
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./tariffs-list/tariffs-list.component').then((m) => m.TariffsListComponent),
  },

  {
    path: 'chargebacks',
    canActivate: [permissionGuard],
    title: 'routes.adjustment.chargebacks.title',
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./chargebacks-list/chargebacks-list.component').then(
        (m) => m.ChargebacksListComponent,
      ),
  },

  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
