import { PERMISSIONS } from '@core/auth/permissions.constants';

import { AppMenuItem } from './menu.model';

export const APP_MENU: AppMenuItem[] = [
  /* Dashboard */
  {
    labelKey: 'menu.dashboard',
    icon: 'pi pi-chart-line text-blue-500',
    route: '/dashboard',
    exact: true,
  },
  /* Conciliation */
  {
    icon: 'pi pi-sync text-purple-400',
    labelKey: 'menu.conciliation.title',
    children: [
      {
        exact: false,
        route: '/conciliation/dashboard',
        labelKey: 'menu.conciliation.dashboard',
        icon: 'pi pi-chart-line text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/erp-vs-acquirer/missing-acquirer',
        labelKey: 'menu.conciliation.erpMissingAcquirer',
        icon: 'pi pi-exclamation-circle text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/erp-vs-acquirer/missing-erp',
        labelKey: 'menu.conciliation.acquirerMissingErp',
        icon: 'pi pi-plus-circle text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/erp-vs-acquirer/other-divergences',
        labelKey: 'menu.conciliation.erpVsAcquirerDivergences',
        icon: 'pi pi-search text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/fees',
        labelKey: 'menu.conciliation.fees',
        icon: 'pi pi-percentage text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/bank-settlement',
        labelKey: 'menu.conciliation.bankSettlement',
        icon: 'pi pi-wallet text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/debits',
        labelKey: 'menu.conciliation.debits',
        icon: 'pi pi-minus-circle text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/chargebacks',
        labelKey: 'menu.conciliation.chargebacks',
        icon: 'pi pi-shield text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/divergences',
        labelKey: 'menu.conciliation.divergences',
        icon: 'pi pi-exclamation-triangle text-purple-500',
      },
      {
        exact: false,
        route: '/conciliation/aging',
        labelKey: 'menu.conciliation.aging',
        icon: 'pi pi-hourglass text-purple-500',
      },
    ],
  },
  /* ERP */
  {
    icon: 'pi pi-briefcase text-teal-500',
    labelKey: 'menu.transactions.erp.title',
    children: [
      {
        exact: false,
        route: '/documents/erp/sales',
        labelKey: 'menu.transactions.erp.sales',
        icon: 'pi pi-shopping-bag text-teal-400',
      },
      {
        exact: false,
        route: '/documents/erp/installments',
        labelKey: 'menu.transactions.erp.installments',
        icon: 'pi pi-list-check text-teal-400',
      },
    ],
  },
  /* ACQ */
  {
    icon: 'pi pi-briefcase text-teal-500',
    labelKey: 'menu.transactions.acq.title',
    children: [
      {
        exact: false,
        route: '/documents/acq/sales',
        labelKey: 'menu.transactions.acq.sales',
        icon: 'pi pi-shopping-bag text-teal-400',
      },
      {
        exact: false,
        route: '/documents/acq/installments',
        labelKey: 'menu.transactions.acq.installments',
        icon: 'pi pi-list-check text-teal-400',
      },
    ],
  },
  /* Security */
  {
    icon: 'pi pi-shield text-red-500',
    labelKey: 'menu.security.title',
    children: [
      {
        labelKey: 'menu.security.users',
        icon: 'pi pi-user text-red-400',
        route: '/security/users',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.USERS.VIEW],
      },
      {
        labelKey: 'menu.security.groups',
        icon: 'pi pi-id-card text-red-400',
        route: '/security/groups',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.GROUPS.VIEW],
      },
    ],
  },
  /* Register */
  {
    icon: 'pi pi-folder-open text-orange-500',
    labelKey: 'menu.register.title',
    children: [
      {
        labelKey: 'menu.register.company',
        icon: 'pi pi-building text-orange-400',
        route: '/register/company',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.register.acquirer',
        icon: 'pi pi-sitemap text-orange-400',
        route: '/register/acquirer',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ACQUIRER.VIEW],
      },
      {
        labelKey: 'menu.register.establishment',
        icon: 'pi pi-shop text-orange-400',
        route: '/register/establishment',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.ESTABLISHMENT.VIEW],
      },
      {
        labelKey: 'menu.register.flags',
        icon: 'pi pi-flag text-orange-400',
        route: '/register/flags',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FLAGS.VIEW],
      },
      {
        labelKey: 'menu.register.contracts',
        icon: 'pi pi-file-edit text-orange-400',
        route: '/register/contract',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.CONTRACTS.VIEW],
      },
    ],
  },
  /* File Processing */
  {
    labelKey: 'menu.file.processing.title',
    icon: 'pi pi-folder-open',
    children: [
      {
        labelKey: 'menu.file.processing.dashboard',
        icon: 'pi pi-chart-line',
        route: '/file-processing',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.file',
        icon: 'pi pi-list',
        route: '/file-processing/files',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.erpPendent',
        icon: 'pi pi-exclamation-triangle',
        route: '/file-processing/erp/pending-sales',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.scheduler',
        icon: 'pi pi-clock',
        route: '/file-processing/schedules',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.creditOrders',
        icon: 'pi pi-credit-card',
        route: '/file-processing/rede/credit-orders',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.adjustments',
        icon: 'pi pi-sliders-h',
        route: '/file-processing/rede/adjustments',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.anticipations',
        icon: 'pi pi-forward',
        route: '/file-processing/rede/anticipations',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.pendingDebts',
        icon: 'pi pi-hourglass',
        route: '/file-processing/rede/pending-debts',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.settledDebts',
        icon: 'pi pi-check-circle',
        route: '/file-processing/rede/settled-debts',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.totalizers',
        icon: 'pi pi-calculator',
        route: '/file-processing/rede/totalizers',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.bankReleases',
        icon: 'pi pi-wallet',
        route: '/file-processing/bank/releases',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.divergences',
        icon: 'pi pi-exclamation-circle',
        route: '/file-processing/divergences',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
    ],
  },
  /* Audit */
  {
    icon: 'pi pi-history text-cyan-500',
    labelKey: 'menu.audit.title',
    children: [
      {
        labelKey: 'menu.audit.mail',
        route: '/audit',
        exact: false,
        icon: 'pi pi-envelope text-cyan-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.AUDIT.VIEW],
      },
    ],
  },
  /* Settings */
  {
    icon: 'pi pi-cog text-indigo-500',
    labelKey: 'menu.settings.title',
    children: [
      {
        labelKey: 'menu.settings.email',
        route: '/settings/email',
        exact: false,
        icon: 'pi pi-envelope text-indigo-400',
      },
    ],
  },
];
