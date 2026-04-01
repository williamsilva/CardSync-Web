import { PERMISSIONS } from '@core/auth/permissions.constants';

import { AppMenuItem } from './menu.model';

export const APP_MENU: AppMenuItem[] = [
  {
    labelKey: 'menu.dashboard',
    icon: 'pi pi-chart-line',
    route: '/dashboard',
    exact: true,
  },

  {
    labelKey: 'menu.company',
    icon: 'pi pi-building',
    route: '/company',
    exact: false,
    permissions: [PERMISSIONS.COMPANIES.VIEW],
  },

  {
    icon: 'pi pi-shield',
    labelKey: 'menu.security.title',
    children: [
      {
        labelKey: 'menu.security.users',
        icon: 'pi pi-user',
        route: '/users',
        exact: false,
        permissions: [PERMISSIONS.USERS.VIEW],
      },
      {
        labelKey: 'menu.security.groups',
        icon: 'pi pi-id-card',
        route: '/groups',
        permissions: [PERMISSIONS.GROUPS.VIEW],
      },
    ],
  },

  {
    icon: 'pi pi-history',
    labelKey: 'menu.audit.title',
    children: [
      {
        labelKey: 'menu.audit.mail',
        route: '/audit',
        exact: false,
        icon: 'pi pi-envelope',
        permissions: [PERMISSIONS.AUDIT.VIEW],
      },
    ],
  },

  {
    icon: 'pi pi-credit-card',
    labelKey: 'menu.finance.title',
    children: [
      {
        labelKey: 'menu.reconciliation',
        route: '/reconciliation',
        icon: 'pi pi-sync',
      },
      {
        labelKey: 'menu.contracts',
        route: '/contracts',
        icon: 'pi pi-file-edit',
      },
    ],
  },

  {
    icon: 'pi pi-cog',
    labelKey: 'menu.settings.title',
    children: [
      {
        labelKey: 'menu.settings.email',
        route: '/settings/email',
        icon: 'pi pi-envelope',
      },
    ],
  },
];
