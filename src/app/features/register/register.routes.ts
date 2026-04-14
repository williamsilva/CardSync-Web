import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const REGISTER_ROUTES: Routes = [
  {
    path: 'company',
    title: 'routes.register.company.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./company/company-list/company-list.component').then((m) => m.CompanyListComponent),
  },
  {
    path: 'acquirer',
    title: 'routes.register.acquirer.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.ACQUIRER.VIEW],
    },
    loadComponent: () =>
      import('./acquirer/acquirer-list/acquirer-list-component').then(
        (m) => m.AcquirerListComponent,
      ),
  },
  {
    path: 'establishment',
    title: 'routes.register.establishment.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.ESTABLISHMENT.VIEW],
    },
    loadComponent: () =>
      import('./establishment/establishment-list/establishment-list-component').then(
        (m) => m.EstablishmentListComponent,
      ),
  },
  {
    path: 'flags',
    title: 'routes.register.flags.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.FLAGS.VIEW],
    },
    loadComponent: () =>
      import('./flag/flag-list/flag-list.component').then((m) => m.FlagListComponent),
  },
  {
    path: 'contract',
    title: 'routes.register.contract.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.CONTRACTS.VIEW],
    },
    loadComponent: () =>
      import('./contract/contract-list/contract-list').then((m) => m.ContractListComponent),
  },
];
