import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const ADJUSTMENT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tariffs' },

  {
    path: 'chargeback-requests',
    title: 'routes.adjustment.chargebackRequests.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ADJUSTMENT.CHARGEBACK_REQUESTS_VIEW],
    },
    loadComponent: () =>
      import('./chargeback-request-list/chargeback-request-list.component').then(
        (m) => m.ChargebackRequestListComponent,
      ),
  },

  {
    path: 'cancellation',
    title: 'routes.adjustment.cancellation.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ADJUSTMENT.CANCELLATION_VIEW],
    },
    loadComponent: () =>
      import('./cancellation-list/cancellation-list.component').then(
        (m) => m.CancellationListComponent,
      ),
  },

  {
    path: 'tariffs',
    canActivate: [permissionGuard],
    title: 'routes.adjustment.tariffs.title',
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ADJUSTMENT.TARIFFS_VIEW],
    },
    loadComponent: () =>
      import('./tariffs-list/tariffs-list.component').then((m) => m.TariffsListComponent),
  },

  {
    path: 'chargebacks',
    canActivate: [permissionGuard],
    title: 'routes.adjustment.chargebacks.title',
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ADJUSTMENT.CHARGEBACK_ANALYSIS_VIEW],
    },
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
