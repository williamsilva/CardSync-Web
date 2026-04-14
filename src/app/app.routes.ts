import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { PERMISSIONS } from './core/auth/permissions.constants';
import { permissionGuard } from './core/auth/permission.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'register',
        loadChildren: () =>
          import('./features/register/register.routes').then((m) => m.REGISTER_ROUTES),
      },

      {
        path: 'security',
        loadChildren: () =>
          import('./features/security/security.routes').then((m) => m.SECURITY_ROUTES),
      },

      {
        path: 'dashboard',
        title: 'routes.dashboard.title',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      {
        path: 'audit',
        title: 'routes.audit.title',
        canActivate: [permissionGuard],
        data: {
          requireAll: false,
          redirectTo: '/forbidden',
          permissions: [PERMISSIONS.AUDIT.VIEW],
        },
        loadComponent: () =>
          import('./features/audit/email-logs.component').then((m) => m.EmailLogsComponent),
      },

      {
        path: 'forbidden',
        title: 'routes.forbidden.title',
        loadComponent: () =>
          import('./features/error/forbidden/forbidden.page').then((m) => m.ForbiddenPage),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
