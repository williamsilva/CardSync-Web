import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'erp',
  },
  {
    path: 'erp',
    loadChildren: () => import('./erp/erp.routes').then((m) => m.ERP_ROUTES),
  },
  {
    path: 'acq',
    loadChildren: () => import('./acq/acq.routes').then((m) => m.ACQUIRERS_ROUTES),
  },
  {
    path: 'forbidden',
    title: 'routes.forbidden.title',
    loadComponent: () => import('../error/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
  },
  {
    path: 'not-found',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
