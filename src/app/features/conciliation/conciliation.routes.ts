import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const CONCILIATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reconciliation-actions' },
  {
    path: 'execution-history',
    title: 'routes.conciliation.executionHistory.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.PIPELINE_VIEW],
    },
    loadComponent: () =>
      import('./conciliation-execution-history/conciliation-execution-history.component').then(
        (m) => m.ConciliationExecutionHistoryComponent,
      ),
  },
  {
    path: 'reconciliation-actions',
    title: 'routes.conciliation.reconciliationActions.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [
        PERMISSIONS.SUPPORT,
        PERMISSIONS.CONCILIATION.PIPELINE_PROCESS,
        PERMISSIONS.CONCILIATION.WAITING_PROCESS,
        PERMISSIONS.CONCILIATION.BANK_ACQUIRER_PROCESS,
      ],
    },
    loadComponent: () =>
      import('./reconciliation-actions/reconciliation-actions.component').then(
        (m) => m.ReconciliationActionsComponent,
      ),
  },
  {
    path: 'erp-vs-acquirer',
    title: 'routes.conciliation.erpVsAcquirer.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.WAITING_VIEW],
    },
    loadComponent: () =>
      import('./conciliation-waiting-list/erp-vs-acquirer-list/erp-vs-acquirer-list.component').then(
        (m) => m.ErpVsAcquirerListComponent,
      ),
  },
  // Compatibilidade com links/favoritos antigos (as 3 views agora são abas dentro de erp-vs-acquirer).
  {
    path: 'erp-vs-acquirer/missing-acquirer',
    redirectTo: () => '/conciliation/erp-vs-acquirer?view=missing-acquirer',
  },
  {
    path: 'erp-vs-acquirer/missing-erp',
    redirectTo: () => '/conciliation/erp-vs-acquirer?view=missing-erp',
  },
  {
    path: 'erp-vs-acquirer/other-divergences',
    redirectTo: () => '/conciliation/erp-vs-acquirer?view=other-divergences',
  },
  {
    path: 'manual',
    title: 'routes.conciliation.manualTools.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [
        PERMISSIONS.SUPPORT,
        PERMISSIONS.FILE_PROCESSING.PROCESS,
        PERMISSIONS.CONCILIATION.MANUAL_BANK_RECONCILIATION,
      ],
    },
    loadComponent: () =>
      import('./manual-conciliation/manual-conciliation.component').then(
        (m) => m.ManualConciliationComponent,
      ),
  },
  // Compatibilidade com links/favoritos antigos (as 4 views agora são abas dentro de manual).
  {
    path: 'manual-sales-summary',
    redirectTo: () => '/conciliation/manual?view=manual-sales-summary',
  },
  {
    path: 'manual-credit-order',
    redirectTo: () => '/conciliation/manual?view=manual-credit-order',
  },
  {
    path: 'manual-bank-statement',
    redirectTo: () => '/conciliation/manual?view=manual-bank-statement',
  },
  {
    path: 'manual-bank-reconciliation',
    redirectTo: () => '/conciliation/manual?view=manual-bank-reconciliation',
  },
  {
    path: 'contract-audit',
    title: 'routes.conciliation.contractAudit.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONTRACT_AUDIT.VIEW],
    },
    loadComponent: () =>
      import('./contract-audit-list/contract-audit-list.component').then(
        (m) => m.ContractAuditListComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
