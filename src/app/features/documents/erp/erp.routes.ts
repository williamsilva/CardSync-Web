import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const ERP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sales' },
  {
    path: 'sales',
    title: 'routes.transactions.erp.sales.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.ERP_SALES.VIEW],
    },
    loadComponent: () =>
      import('./transactions-erp-sales-list/transactions-erp-sales-list.component').then(
        (m) => m.TransactionsErpSalesListComponent,
      ),
  },
  {
    path: 'installments',
    title: 'routes.erp.installments.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.DOCUMENTS.ERP_INSTALLMENTS.VIEW],
    },
    loadComponent: () =>
      import('./transactions-erp-installments-list/transactions-erp-installments-list.component').then(
        (m) => m.ErpParcelsListComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
