import { PERMISSIONS } from '@core/auth/permissions.constants';

import { AppMenuItem } from './menu.model';

export const APP_MENU: AppMenuItem[] = [
  {
    labelKey: 'menu.dashboard',
    icon: 'pi pi-chart-line',
    route: '/dashboard',
    exact: true,
  },

  /* Security */
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

  /* Cadastros */
  {
    icon: 'pi pi-folder-open',
    labelKey: 'menu.register.title',
    children: [
      {
        labelKey: 'menu.register.company',
        icon: 'pi pi-building',
        route: '/company',
        exact: false,
        permissions: [PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.register.acquirer',
        icon: 'pi pi-sitemap',
        route: '/acquirer',
        exact: false,
        //permissions: [PERMISSIONS.REGISTER.VIEW],
      },
    ],
  },

  /* Histotico*/
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

  /* Outros */
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
