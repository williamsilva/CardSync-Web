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
    company: 'menu.company',
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

    // TODO: Ajustar depois
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
  enum: {
    statusEnum: {
      null: 'enum.statusEnum.null',
      active: 'enum.statusEnum.active',
      unknown: 'enum.statusEnum.unknown',
      blocked: 'enum.statusEnum.blocked',
      inactive: 'enum.statusEnum.inactive',
    },
    typeCompanyEnum: {
      null: 'enum.typeCompanyEnum.null',
      filial: 'enum.typeCompanyEnum.filial',
      matriz: 'enum.typeCompanyEnum.matriz',
      unknown: 'enum.typeCompanyEnum.unknown',
    },
  },
  company: {
    form: {
      created: 'company.form.created',
      updated: 'company.form.updated',
      saveError: 'company.form.saveError',
    },
    statusEnum: {
      active: 'company.statusEnum.active',
      blocked: 'company.statusEnum.blocked',
      inactive: 'company.statusEnum.inactive',
    },

    typeEnum: {
      matriz: 'company.typeEnum.matriz',
      filial: 'company.typeEnum.filial',
    },
    block: {
      header: 'company.block.header',
      successBulk: 'company.block.successBulk',
      messageBulk: 'company.block.messageBulk',
      messageSingle: 'company.block.messageSingle',
      successSingle: 'company.block.successSingle',
    },
    activate: {
      header: 'company.activate.header',
      messageBulk: 'company.activate.messageBulk',
      successBulk: 'company.activate.successBulk',
      messageSingle: 'company.activate.messageSingle',
      successSingle: 'company.activate.successSingle',
    },
    deactivate: {
      header: 'company.deactivate.header',
      messageBulk: 'company.deactivate.messageBulk',
      successBulk: 'company.deactivate.successBulk',
      messageSingle: 'company.deactivate.messageSingle',
      successSingle: 'company.deactivate.successSingle',
    },
    selection: {
      mode: {
        none: 'company.selection.mode.none',
        block: 'company.selection.mode.block',
        activate: 'company.selection.mode.activate',
        deactivate: 'company.selection.mode.deactivate',
      },
    },
    fields: {
      cnpj: 'company.fields.cnpj',
      typeEnum: 'company.fields.typeEnum',
      createdAt: 'company.fields.createdAt',
      createdBy: 'company.fields.createdBy',
      statusEnum: 'company.fields.statusEnum',
      fantasyName: 'company.fields.fantasyName',
      socialReason: 'company.fields.socialReason',
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
