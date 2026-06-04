import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const ACQUIRERS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sales' },
  {
    path: 'sales',
    title: 'routes.transactions.acq.sales.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.ACQUIRERS_SALES.VIEW],
    },
    loadComponent: () =>
      import('./transactions-acq-sales-list/transactions-acq-sales-list.component').then(
        (m) => m.TransactionsAcquirersSalesListComponent,
      ),
  },
  {
    path: 'installments',
    title: 'routes.transactions.acq.installments.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.ACQUIRERS_INSTALLMENTS.VIEW],
    },
    loadComponent: () =>
      import('./transactions-acq-installments-list/transactions-acq-installments-list.component').then(
        (m) => m.AcqInstallmentsListComponent,
      ),
  },
  {
    path: 'anticipation',
    title: 'routes.transactions.anticipation.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.ANTICIPATION.VIEW],
    },
    loadComponent: () =>
      import('./anticipation/anticipation-list.component').then((m) => m.AnticipationListComponent),
  },
  {
    path: 'sales-summary',
    title: 'routes.transactions.saleSummary.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.SALES_SUMMARY.VIEW],
    },
    loadComponent: () =>
      import('./sales-summary/sale-summary.component').then((m) => m.SaleSummaryListComponent),
  },
  {
    path: 'credit-order',
    title: 'routes.transactions.creditOrder.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.CREDIT_ORDER.VIEW],
    },
    loadComponent: () =>
      import('./credit-order/credit-order.component').then((m) => m.CreditOrderListComponent),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
