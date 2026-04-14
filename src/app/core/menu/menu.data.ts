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
    icon: 'pi pi-shield',
    labelKey: 'menu.security.title',
    children: [
      {
        labelKey: 'menu.security.users',
        icon: 'pi pi-user',
        route: '/security/users',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.USERS.VIEW],
      },
      {
        labelKey: 'menu.security.groups',
        icon: 'pi pi-id-card',
        route: '/security/groups',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.GROUPS.VIEW],
      },
    ],
  },

  {
    icon: 'pi pi-folder-open',
    labelKey: 'menu.register.title',
    children: [
      {
        labelKey: 'menu.register.company',
        icon: 'pi pi-building',
        route: '/register/company',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.register.acquirer',
        icon: 'pi pi-sitemap',
        route: '/register/acquirer',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ACQUIRER.VIEW],
      },
      {
        labelKey: 'menu.register.establishment',
        icon: 'pi pi-shop',
        route: '/register/establishment',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ESTABLISHMENT.VIEW],
      },
      {
        labelKey: 'menu.register.flags',
        icon: 'pi pi-flag',
        route: '/register/flags',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FLAGS.VIEW],
      },
      {
        labelKey: 'menu.register.contracts',
        icon: 'pi pi-file-edit',
        route: '/register/contract',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONTRACTS.VIEW],
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
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.AUDIT.VIEW],
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
