import { Routes } from '@angular/router';

import { PERMISSIONS } from '@core/auth/permissions.constants';

import { authGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { permissionGuard } from './core/auth/permission.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'account/password',
        title: 'routes.accountPassword.title',
        loadComponent: () =>
          import('./features/security/account-password/account-password.component').then(
            (m) => m.AccountPasswordComponent,
          ),
      },
      {
        path: 'dashboard',
        title: 'routes.dashboard.title',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      {
        path: 'users',
        title: 'routes.users.title',
        canActivate: [permissionGuard],
        data: {
          requireAll: false,
          redirectTo: '/403',
          permissions: [PERMISSIONS.USERS.VIEW],
        },
        loadComponent: () =>
          import('./features/security/users/users-list/users-list.component').then(
            (m) => m.UsersListComponent,
          ),
      },

      {
        path: 'groups',
        title: 'routes.groups.title',
        canActivate: [permissionGuard],
        data: {
          requireAll: false,
          redirectTo: '/403',
          permissions: [PERMISSIONS.GROUPS.VIEW],
        },
        loadComponent: () =>
          import('./features/security/groups/groups-list/groups-list.component').then(
            (m) => m.GroupsListComponent,
          ),
      },
      {
        path: 'groups/:id',
        title: 'routes.groupDetail.title',
        canActivate: [permissionGuard],
        data: {
          requireAll: false,
          redirectTo: '/403',
          permissions: [PERMISSIONS.GROUPS.VIEW],
        },
        loadComponent: () =>
          import('./features/security/groups/group-detail/group-detail.component').then(
            (m) => m.GroupDetailComponent,
          ),
      },
      {
        path: 'account/profile',
        title: 'routes.accountProfile.title',
        loadComponent: () =>
          import('./features/security/profile/profile.component').then(
            (m) => m.ProfilePageComponent,
          ),
      },

      {
        path: 'companies',
        title: 'routes.companies.title',
        loadComponent: () =>
          import('./features/companies/companies-list/companies-list.component').then(
            (m) => m.CompaniesListComponent,
          ),
      },

      {
        path: 'audit',
        title: 'routes.audit.title',
        loadComponent: () =>
          import('./features/audit/email-logs.component').then((m) => m.EmailLogsComponent),
      },

      {
        path: 'companies/new',
        title: 'routes.companiesNew.title',
        loadComponent: () =>
          import('./features/companies/companies-create/companies-create.component').then(
            (m) => m.CompaniesFormComponent,
          ),
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
