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
    pathMatch: 'full',
    redirectTo: 'erp-vs-acquirer/missing-acquirer',
  },
  {
    path: 'erp-vs-acquirer/missing-acquirer',
    title: 'routes.conciliation.erpVsAcquirer.missingAcquirer.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.WAITING_VIEW],
      view: 'MISSING_ACQUIRER',
    },
    loadComponent: () =>
      import('./conciliation-waiting-list/missing-acquirer-list/missing-acquirer-list.component').then(
        (m) => m.MissingAcquirerListComponent,
      ),
  },
  {
    path: 'erp-vs-acquirer/missing-erp',
    title: 'routes.conciliation.erpVsAcquirer.missingErp.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.WAITING_VIEW],
      view: 'MISSING_ERP',
    },
    loadComponent: () =>
      import('./conciliation-waiting-list/missing-erp-list/missing-erp-list.component').then(
        (m) => m.MissingErpListComponent,
      ),
  },
  {
    path: 'erp-vs-acquirer/other-divergences',
    title: 'routes.conciliation.erpVsAcquirer.otherDivergences.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONCILIATION.WAITING_VIEW],
      view: 'OTHER_DIVERGENCES',
    },
    loadComponent: () =>
      import('./conciliation-waiting-list/other-divergences-list/other-divergences-list.component').then(
        (m) => m.ErpVsAcquirerOtherDivergencesListComponent,
      ),
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
