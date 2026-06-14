import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const REGISTER_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'company' },
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
      import('./contract/contract-list/contract-list-component').then(
        (m) => m.ContractListComponent,
      ),
  },
  {
    path: 'holidays',
    title: 'routes.register.holidays.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.HOLIDAYS.VIEW],
    },
    loadComponent: () =>
      import('./holiday/holiday-list/holiday-list.component').then((m) => m.HolidayListComponent),
  },
  {
    path: 'banks',
    title: 'routes.register.banks.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.BANKS.VIEW],
    },
    loadComponent: () =>
      import('./bank/bank-list/bank-list.component').then((m) => m.BankListComponent),
  },
  {
    path: 'banking-domicile',
    title: 'routes.register.bankingDomicile.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.BANKING_DOMICILE.VIEW],
    },
    loadComponent: () =>
      import('./banking-domicile/banking-domicile-list/banking-domicile-list.component').then(
        (m) => m.BankingDomicileListComponent,
      ),
  },
  {
    path: 'no-file-day',
    title: 'routes.register.noFileDay.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.NO_FILE_DAY.VIEW],
    },
    loadComponent: () =>
      import('./no-file-day/no-file-day-list/no-file-day-list.component').then(
        (m) => m.NoFileDayListComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
