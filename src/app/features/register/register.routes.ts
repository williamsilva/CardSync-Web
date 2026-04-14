import { Routes } from '@angular/router';

export const REGISTER_ROUTES: Routes = [
  {
    path: 'company',
    title: 'routes.register.company.title',
    loadComponent: () =>
      import('./company/company-list/company-list.component').then((m) => m.CompanyListComponent),
  },
  {
    path: 'acquirer',
    title: 'routes.register.acquirer.title',
    loadComponent: () =>
      import('./acquirer/acquirer-list/acquirer-list-component').then(
        (m) => m.AcquirerListComponent,
      ),
  },
  {
    path: 'establishment',
    title: 'routes.register.establishment.title',
    loadComponent: () =>
      import('./establishment/establishment-list/establishment-list-component').then(
        (m) => m.EstablishmentListComponent,
      ),
  },
  {
    path: 'flags',
    title: 'routes.register.flags.title',
    loadComponent: () =>
      import('./flag/flag-list/flag-list.component').then((m) => m.FlagListComponent),
  },
  {
    path: 'contract',
    title: 'routes.register.contract.title',
    loadComponent: () =>
      import('./contract/contract-list/contract-list').then((m) => m.ContractListComponent),
  },
];
