export const UI_KEYS = {
  topbar: {
    online: 'topbar.online',
    brandSub: 'topbar.brandSub',
    langAria: 'topbar.langAria',
    brandName: 'topbar.brandName',
    sessionExpired: 'topbar.sessionExpired',
    themeToggleAria: 'topbar.themeToggleAria',
    sidebarToggleAria: 'topbar.sidebarToggleAria',
    sidebarShowTooltip: 'topbar.sidebarShowTooltip',
    sidebarHideTooltip: 'topbar.sidebarHideTooltip',
    sessionExpireTooltip: 'topbar.sessionExpireTooltip',
    sessionExpiredTooltip: 'topbar.sessionExpiredTooltip',
  },

  menu: {
    me: 'menu.me',
    dashboard: 'menu.dashboard',
    companies: 'menu.companies',
    audit: {
      title: 'menu.audit.title',
      mail: 'menu.audit.mail',
    },
    security: {
      title: 'menu.security.title',
      users: 'menu.security.users',
      groups: 'menu.security.groups',
      myAccount: 'menu.security.myAccount',
      changePassword: 'menu.security.changePassword',
    },
    // Ajustar depois
    finance: 'menu.finance.title',
    contracts: 'menu.contracts',
    settings: {
      title: 'menu.settings.title',
      email: 'menu.settings.email',
    },
    reconciliation: 'menu.reconciliation',
  },

  sidebar: {
    userFallback: 'sidebar.userFallback',
    logout: 'sidebar.logout',
  },

  accountPassword: {
    successTitle: 'accountPassword.successTitle',
    userFallback: 'accountPassword.userFallback',
    successMessage: 'accountPassword.successMessage',
    usernameFallback: 'accountPassword.usernameFallback',
  },

  users: {
    status: {
      active: 'users.status.active',
      blocked: 'users.status.blocked',
      disabled: 'users.status.disabled',
      inactive: 'users.status.inactive',
      pending_password: 'users.status.pending_password',
      unknown: 'users.status.unknown',
      null: 'users.status.null',
    },

    delete: {
      error: 'users.delete.error',
      header: 'users.delete.header',
      message: 'users.delete.message',
      success: 'users.delete.success',
    },
    invite: {
      resend: 'users.invite.resend',
      resent: 'users.invite.resent',
      resendError: 'users.invite.resendError',
    },

    selection: {
      mode: {
        none: 'users.selection.mode.none',
        activate: 'users.selection.mode.activate',
        deactivate: 'users.selection.mode.deactivate',
      },
    },

    activate: {
      header: 'users.activate.header',
      successBulk: 'users.activate.successBulk',
      messageBulk: 'users.activate.messageBulk',
      messageSingle: 'users.activate.messageSingle',
      successSingle: 'users.activate.successSingle',
    },
    deactivate: {
      header: 'users.deactivate.header',
      successBulk: 'users.deactivate.successBulk',
      messageBulk: 'users.deactivate.messageBulk',
      messageSingle: 'users.deactivate.messageSingle',
      successSingle: 'users.deactivate.successSingle',
    },

    fields: {
      name: 'users.fields.name',
      status: 'users.fields.status',
      groups: 'users.fields.groups',
      userName: 'users.fields.userName',
      document: 'users.fields.document',
      createdAt: 'users.fields.createdAt',

      lastLoginAt: 'users.fields.lastLoginAt',
      blockedUntil: 'users.fields.blockedUntil',
      passwordChangedAt: 'users.fields.passwordChangedAt',
      passwordExpiresAt: 'users.fields.passwordExpiresAt',
    },

    form: {
      loadError: 'users.form.loadError',
      updated: 'users.form.updated',
      created: 'users.form.created',
      saveError: 'users.form.saveError',
      resend: {
        header: 'users.form.resend.header',
        message: 'users.form.resend.message',
        sent: 'users.form.resend.sent',
        error: 'users.form.resend.error',
        todoServer: 'users.form.resend.todoServer',
      },
    },
  },

  groups: {
    fields: {
      name: 'groups.fields.name',
      description: 'groups.fields.description',
    },
    form: {
      updated: 'groups.form.updated',
      created: 'groups.form.created',
      loadError: 'groups.form.loadError',
      saveError: 'groups.form.saveError',
    },
  },
  audit: {
    emailLog: {
      fields: {
        status: 'audit.emailLog.fields.status',
        subject: 'audit.emailLog.fields.subject',
        template: 'audit.emailLog.fields.template',
        recipient: 'audit.emailLog.fields.recipient',
        eventType: 'audit.emailLog.fields.eventType',
        sentAt: 'audit.emailLog.fields.sentAt',
      },
      status: {
        null: 'audit.emailLog.status.null',
        sent: 'audit.emailLog.status.sent',
        failed: 'audit.emailLog.status.failed',
        unknown: 'audit.emailLog.status.unknown',
      },
      eventType: {
        null: 'audit.emailLog.eventType.null',
        unknown: 'audit.emailLog.eventType.unknown',
        passwordReset: 'audit.emailLog.eventType.passwordReset',
        firstPassword: 'audit.emailLog.eventType.firstPassword',
      },
    },
  },
  validation: {
    required: 'validation.required',
    minLength: 'validation.minLength',
    maxLength: 'validation.maxLength',
    invalid: 'validation.invalid',
  },

  pagination: {
    report: 'pagination.report',
  },

  common: {
    no: 'common.no',
    yes: 'common.yes',
    send: 'common.send',
    info: 'common.info',
    save: 'common.save',
    error: 'common.error',
    cancel: 'common.cancel',
    delete: 'common.delete',
    logout: 'common.logout',
    warning: 'common.warning',
    success: 'common.success',
    notInformed: 'common.notInformed',
  },

  confirm: {
    logoutTitle: 'confirm.logoutTitle',
    logoutMessage: 'confirm.logoutMessage',
  },
} as const;

type NestedValues<T> = T extends object ? { [K in keyof T]: NestedValues<T[K]> }[keyof T] : T;

export type UiKey = NestedValues<typeof UI_KEYS>;

// ✅ só keys do menu
export type MenuKey = Extract<UiKey, `menu.${string}`>;
