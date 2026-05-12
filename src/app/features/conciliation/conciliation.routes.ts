import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

const defaultPermissions = [
  PERMISSIONS.SUPPORT,
  PERMISSIONS.COMPANIES.VIEW,
  PERMISSIONS.ACQUIRER.VIEW,
];

export const CONCILIATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'routes.conciliation.dashboard.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./conciliation-dashboard/conciliation-dashboard.component').then(
        (m) => m.ConciliationDashboardComponent,
      ),
  },

  {
    path: 'erp-vs-acquirer',
    title: 'routes.conciliation.erpVsAcquirer.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./erp-vs-acquirer-list/erp-vs-acquirer-list.component').then(
        (m) => m.ErpVsAcquirerListComponent,
      ),
  },
  {
    path: 'fees',
    title: 'routes.conciliation.fees.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./conciliation-fees-list/conciliation-fees-list.component').then(
        (m) => m.ConciliationFeesListComponent,
      ),
  },
  {
    path: 'debits',
    title: 'routes.conciliation.debits.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./conciliation-debits-list/conciliation-debits-list.component').then(
        (m) => m.ConciliationDebitsListComponent,
      ),
  },
  {
    path: 'chargebacks',
    title: 'routes.conciliation.chargebacks.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./conciliation-chargebacks-list/conciliation-chargebacks-list.component').then(
        (m) => m.ConciliationChargebacksListComponent,
      ),
  },
  {
    path: 'bank-settlement',
    title: 'routes.conciliation.bankSettlement.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./bank-settlement-list/bank-settlement-list.component').then(
        (m) => m.BankSettlementListComponent,
      ),
  },
  {
    path: 'divergences',
    title: 'routes.conciliation.divergences.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./conciliation-divergences-list/conciliation-divergences-list.component').then(
        (m) => m.ConciliationDivergencesListComponent,
      ),
  },
  {
    path: 'aging',
    title: 'routes.conciliation.aging.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: defaultPermissions },
    loadComponent: () =>
      import('./conciliation-aging/conciliation-aging.component').then(
        (m) => m.ConciliationAgingComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
