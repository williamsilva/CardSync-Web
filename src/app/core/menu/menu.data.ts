import { PERMISSIONS } from '@core/auth/permissions.constants';

import { AppMenuItem } from './menu.model';

export const APP_MENU: AppMenuItem[] = [
  // https://tailscan.com/tailwind/typography/text-color-class

  /* Dashboard */
  {
    labelKey: 'menu.dashboard',
    icon: 'pi pi-chart-line text-blue-600',
    children: [
      {
        exact: false,
        route: '/dashboard/management',
        labelKey: 'menu.dashboardManagement',
        icon: 'pi pi-chart-bar text-blue-400',
      },
      {
        exact: true,
        route: '/dashboard',
        labelKey: 'menu.dashboardAudit',
        icon: 'pi pi-chart-line text-blue-400',
      },
    ],
  },
  /* ERP */
  {
    icon: 'pi pi-briefcase text-teal-600',
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
    icon: 'pi pi-credit-card text-cyan-600',
    labelKey: 'menu.transactions.acq.title',
    children: [
      {
        exact: false,
        route: '/documents/acq/credit-order',
        labelKey: 'menu.transactions.creditOrder.title',
        icon: 'pi pi-wallet text-cyan-400',
      },
      {
        exact: false,
        route: '/documents/acq/sales-summary',
        labelKey: 'menu.transactions.saleSummary.title',
        icon: 'pi pi-receipt text-cyan-400',
      },
      {
        exact: false,
        route: '/documents/acq/anticipation',
        labelKey: 'menu.transactions.anticipation.title',
        icon: 'pi pi-calendar-clock text-cyan-400',
      },
      {
        exact: false,
        route: '/documents/acq/sales',
        labelKey: 'menu.transactions.acq.sales',
        icon: 'pi pi-credit-card text-cyan-400',
      },
      {
        exact: false,
        route: '/documents/acq/installments',
        labelKey: 'menu.transactions.acq.installments',
        icon: 'pi pi-list-check text-cyan-400',
      },
    ],
  },

  /* Banks */
  {
    icon: 'pi pi-building-columns text-emerald-600',
    labelKey: 'menu.transactions.banks.title',
    children: [
      {
        exact: false,
        route: '/documents/bank/bank_statement',
        labelKey: 'menu.transactions.banks.bankStatement',
        icon: 'pi pi-table text-emerald-400',
      },
    ],
  },
  /* Adjustment — cor amber (unica, diferente de todos os outros grupos) */
  {
    icon: 'pi pi-sliders-h text-amber-600',
    labelKey: 'menu.adjustment.title',
    children: [
      {
        exact: false,
        route: '/adjustment/tariffs',
        labelKey: 'menu.adjustment.tariffs.title',
        icon: 'pi pi-percentage text-amber-400',
      },
      {
        exact: false,
        route: '/adjustment/cancellation',
        labelKey: 'menu.adjustment.cancellation.title',
        icon: 'pi pi-times-circle text-amber-400',
      },
      {
        exact: false,
        route: '/adjustment/chargeback-requests',
        labelKey: 'menu.adjustment.chargebackRequests.title',
        icon: 'pi pi-exclamation-circle text-amber-400',
      },
      {
        exact: false,
        route: '/adjustment/chargebacks',
        labelKey: 'menu.adjustment.chargebacks.title',
        icon: 'pi pi-shield text-amber-400',
      },
    ],
  },
  /* Conciliation — cor purple */
  {
    icon: 'pi pi-sync text-purple-600',
    labelKey: 'menu.conciliation.title',
    children: [
      {
        exact: false,
        route: '/conciliation/dashboard',
        labelKey: 'menu.conciliation.dashboard',
        icon: 'pi pi-chart-line text-purple-400',
      },
      {
        exact: false,
        route: '/conciliation/erp-vs-acquirer/missing-acquirer',
        labelKey: 'menu.conciliation.erpMissingAcquirer',
        icon: 'pi pi-exclamation-circle text-purple-400',
      },
      {
        exact: false,
        route: '/conciliation/erp-vs-acquirer/missing-erp',
        labelKey: 'menu.conciliation.acquirerMissingErp',
        icon: 'pi pi-plus-circle text-purple-400',
      },
      {
        exact: false,
        route: '/conciliation/erp-vs-acquirer/other-divergences',
        labelKey: 'menu.conciliation.erpVsAcquirerDivergences',
        icon: 'pi pi-search text-purple-400',
      },
      {
        exact: false,
        route: '/conciliation/contract-audit',
        labelKey: 'menu.conciliation.contractAudit',
        icon: 'pi pi-percentage text-purple-400',
      },
      {
        exact: false,
        route: '/conciliation/aging',
        labelKey: 'menu.conciliation.aging',
        icon: 'pi pi-hourglass text-purple-400',
      },
    ],
  },
  /* Security */
  {
    icon: 'pi pi-shield text-red-600',
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
    icon: 'pi pi-folder-open text-orange-600',
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
  /* File Processing — cor blue */
  {
    labelKey: 'menu.file.processing.title',
    icon: 'pi pi-folder-open text-blue-600',
    children: [
      {
        labelKey: 'menu.file.processing.dashboard',
        icon: 'pi pi-chart-line text-blue-400',
        route: '/file-processing/analytics',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.file',
        icon: 'pi pi-list text-blue-400',
        route: '/file-processing/files',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.calendar',
        icon: 'pi pi-calendar text-blue-400',
        route: '/file-processing/calendar',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.erpPendent',
        icon: 'pi pi-exclamation-triangle text-blue-400',
        route: '/file-processing/erp/pending-sales',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.scheduler',
        icon: 'pi pi-clock text-blue-400',
        route: '/file-processing/schedules',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },

      {
        labelKey: 'menu.file.processing.totalizers',
        icon: 'pi pi-calculator text-blue-400',
        route: '/file-processing/rede/totalizers',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.bankReleases',
        icon: 'pi pi-wallet text-blue-400',
        route: '/file-processing/bank/releases',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
      {
        labelKey: 'menu.file.processing.divergences',
        icon: 'pi pi-exclamation-circle text-blue-400',
        route: '/file-processing/divergences',
        exact: false,
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
      },
    ],
  },
  /* Audit — cor sky (diferente do cyan usado por ACQ) */
  {
    icon: 'pi pi-history text-sky-600',
    labelKey: 'menu.audit.title',
    children: [
      {
        labelKey: 'menu.audit.mail',
        route: '/audit',
        exact: false,
        icon: 'pi pi-envelope text-sky-400',
        permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.AUDIT.VIEW],
      },
    ],
  },
  /* Settings */
  {
    icon: 'pi pi-cog text-indigo-600',
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
