import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const SETTINGS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reconciliation' },
  {
    path: 'reconciliation',
    title: 'routes.settings.reconciliation.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.RECONCILIATION_VIEW],
    },
    loadComponent: () =>
      import('./reconciliation-settings/reconciliation-settings.component').then(
        (m) => m.ReconciliationSettingsComponent,
      ),
  },
  {
    path: 'scheduler',
    title: 'routes.settings.scheduler.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.SCHEDULER_VIEW],
    },
    loadComponent: () =>
      import('./scheduler-settings/scheduler-settings.component').then(
        (m) => m.SchedulerSettingsComponent,
      ),
  },
  {
    path: 'email',
    title: 'routes.settings.email.title',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.SETTINGS.EMAIL_VIEW],
    },
    loadComponent: () =>
      import('./email-settings/email-settings.component').then(
        (m) => m.EmailSettingsComponent,
      ),
  },
  {
    path: '**',
    title: 'routes.notFound.title',
    loadComponent: () => import('../error/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
