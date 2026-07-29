import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const CONCILIATION_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'routes.conciliation.dashboard.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.DASHBOARD_VIEW],
    },
    loadComponent: () =>
      import('./conciliation-dashboard/conciliation-dashboard.component').then(
        (m) => m.ConciliationDashboardComponent,
      ),
  },

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
    path: 'manual-sales-summary',
    title: 'routes.conciliation.manualSalesSummary.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FILE_PROCESSING.PROCESS],
    },
    loadComponent: () =>
      import('./manual-sales-summary/manual-sales-summary.component').then(
        (m) => m.ManualSalesSummaryComponent,
      ),
  },
  {
    path: 'manual-credit-order',
    title: 'routes.conciliation.manualCreditOrder.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FILE_PROCESSING.PROCESS] },
    loadComponent: () =>
      import('./manual-credit-order/manual-credit-order.component').then(
        (m) => m.ManualCreditOrderComponent,
      ),
  },
  {
    path: 'manual-bank-statement',
    title: 'routes.conciliation.manualBankStatement.title',
    canActivate: [permissionGuard],
    data: { requireAll: false, redirectTo: '/forbidden', permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FILE_PROCESSING.PROCESS] },
    loadComponent: () =>
      import('./manual-bank-statement/manual-bank-statement.component').then(
        (m) => m.ManualBankStatementComponent,
      ),
  },
  {
    path: 'manual-bank-reconciliation',
    title: 'routes.conciliation.manualBankReconciliation.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.MANUAL_BANK_RECONCILIATION],
    },
    loadComponent: () =>
      import('./manual-bank-reconciliation/manual-bank-reconciliation.component').then(
        (m) => m.ManualBankReconciliationComponent,
      ),
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
    path: 'aging',
    title: 'routes.conciliation.aging.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.DASHBOARD_VIEW],
    },
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
