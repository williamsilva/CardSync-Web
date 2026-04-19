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
    audit: {
      title: 'menu.audit.title',
      mail: 'menu.audit.mail',
    },
    register: {
      title: 'menu.register.title',
      flags: 'menu.register.flags',
      company: 'menu.register.company',
      acquirer: 'menu.register.acquirer',
      contracts: 'menu.register.contracts',
      establishment: 'menu.register.establishment',
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
  establishment: {
    form: {
      created: 'establishment.form.created',
      updated: 'establishment.form.updated',
      saveError: 'establishment.form.saveError',
    },
    fields: {
      company: 'establishment.fields.company',
      typeEnum: 'establishment.fields.typeEnum',
      acquirer: 'establishment.fields.acquirer',
      pvNumber: 'establishment.fields.pvNumber',
      createdAt: 'establishment.fields.createdAt',
      createdBy: 'establishment.fields.createdBy',
      statusEnum: 'establishment.fields.statusEnum',
    },
    selection: {
      mode: {
        none: 'establishment.selection.mode.none',
      },
    },
    activate: {
      header: 'establishment.activate.header',
      messageBulk: 'establishment.activate.messageBulk',
      successBulk: 'establishment.activate.successBulk',
      messageSingle: 'establishment.activate.messageSingle',
      successSingle: 'establishment.activate.successSingle',
    },
    deactivate: {
      header: 'establishment.deactivate.header',
      messageBulk: 'establishment.deactivate.messageBulk',
      successBulk: 'establishment.deactivate.successBulk',
      messageSingle: 'establishment.deactivate.messageSingle',
      successSingle: 'establishment.deactivate.successSingle',
    },
    block: {
      header: 'establishment.block.header',
      messageBulk: 'establishment.block.messageBulk',
      successBulk: 'establishment.block.successBulk',
      messageSingle: 'establishment.block.messageSingle',
      successSingle: 'establishment.block.successSingle',
    },
    delete: {
      header: 'establishment.delete.header',
      messageBulk: 'establishment.delete.messageBulk',
      successBulk: 'establishment.delete.successBulk',
      messageSingle: 'establishment.delete.messageSingle',
      successSingle: 'establishment.delete.successSingle',
    },
  },
  contract: {
    form: {
      created: 'contract.form.created',
      updated: 'contract.form.updated',
      loadError: 'contract.form.loadError',
      saveError: 'contract.form.saveError',
    },
    fields: {
      name: 'contract.fields.name',
      description: 'contract.fields.description',
      company: 'contract.fields.company',
      acquirer: 'contract.fields.acquirer',
      establishment: 'contract.fields.establishment',
      startDate: 'contract.fields.startDate',
      endDate: 'contract.fields.endDate',
      flag: 'contract.fields.flag',
      modality: 'contract.fields.modality',
      rate: 'contract.fields.rate',
      rateEcommerce: 'contract.fields.rateEcommerce',
      paymentTermDays: 'contract.fields.paymentTermDays',
      paymentTermDaysEcommerce: 'contract.fields.paymentTermDaysEcommerce',
      statusEnum: 'contract.fields.statusEnum',
    },
    selection: {
      mode: {
        none: 'contract.selection.mode.none',
      },
    },
    activate: {
      header: 'contract.activate.header',
      successBulk: 'contract.activate.successBulk',
      messageBulk: 'contract.activate.messageBulk',
      messageSingle: 'contract.activate.messageSingle',
      successSingle: 'contract.activate.successSingle',
    },
    block: {
      header: 'contract.block.header',
      successBulk: 'contract.block.successBulk',
      messageBulk: 'contract.block.messageBulk',
      messageSingle: 'contract.block.messageSingle',
      successSingle: 'contract.block.successSingle',
    },
    deactivate: {
      header: 'contract.deactivate.header',
      successBulk: 'contract.deactivate.successBulk',
      messageBulk: 'contract.deactivate.messageBulk',
      messageSingle: 'contract.deactivate.messageSingle',
      successSingle: 'contract.deactivate.successSingle',
    },
  },
  flag: {
    form: {
      created: 'flag.form.created',
      updated: 'flag.form.updated',
      saveError: 'flag.form.saveError',
    },
    fields: {
      name: 'flag.fields.name',
      erpCode: 'flag.fields.erpCode',
      statusEnum: 'flag.fields.statusEnum',
    },
    columns: {
      name: 'flag.columns.name',
      erpCode: 'flag.columns.erpCode',
      statusEnum: 'flag.columns.statusEnum',
    },
    relationships: {
      removeAcquirer: {
        header: 'flag.relationships.removeAcquirer.header',
        success: 'flag.relationships.removeAcquirer.success',
        message: 'flag.relationships.removeAcquirer.message',
      },
      removeCompany: {
        header: 'flag.relationships.removeCompany.header',
        success: 'flag.relationships.removeCompany.success',
        message: 'flag.relationships.removeCompany.message',
      },
    },
    selection: {
      mode: {
        none: 'flag.selection.mode.none',
      },
    },
    activate: {
      header: 'flag.activate.header',
      successBulk: 'flag.activate.successBulk',
      messageBulk: 'flag.activate.messageBulk',
      messageSingle: 'flag.activate.messageSingle',
      successSingle: 'flag.activate.successSingle',
    },
    block: {
      header: 'flag.block.header',
      successBulk: 'flag.block.successBulk',
      messageBulk: 'flag.block.messageBulk',
      messageSingle: 'flag.block.messageSingle',
      successSingle: 'flag.block.successSingle',
    },
    deactivate: {
      header: 'flag.deactivate.header',
      successBulk: 'flag.deactivate.successBulk',
      messageBulk: 'flag.deactivate.messageBulk',
      messageSingle: 'flag.deactivate.messageSingle',
      successSingle: 'flag.deactivate.successSingle',
    },
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
      createdBy: 'users.fields.createdBy',

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
    typeEstablishmentEnum: {
      null: 'enum.typeEstablishmentEnum.null',
      pdvTef: 'enum.typeEstablishmentEnum.pdvTef',
      ecommerce: 'enum.typeEstablishmentEnum.ecommerce',
      unknown: 'enum.typeEstablishmentEnum.unknown',
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
      createdAt: 'company.fields.createdAt',
      createdBy: 'company.fields.createdBy',
      statusEnum: 'company.fields.statusEnum',
      fantasyName: 'company.fields.fantasyName',
      socialReason: 'company.fields.socialReason',
      typeCompanyEnum: 'company.fields.typeCompanyEnum',
    },
  },
  acquirer: {
    form: {
      created: 'acquirer.form.created',
      updated: 'acquirer.form.updated',
      saveError: 'acquirer.form.saveError',
    },
    fields: {
      cnpj: 'acquirer.fields.cnpj',
      createdAt: 'acquirer.fields.createdAt',
      createdBy: 'acquirer.fields.createdBy',
      statusEnum: 'acquirer.fields.statusEnum',
      fantasyName: 'acquirer.fields.fantasyName',
      socialReason: 'acquirer.fields.socialReason',
    },
    selection: {
      mode: {
        none: 'acquirer.selection.mode.none',
      },
    },
    block: {
      header: 'acquirer.block.header',
      messageBulk: 'acquirer.block.messageBulk',
      successBulk: 'acquirer.block.successBulk',
      messageSingle: 'acquirer.block.messageSingle',
      successSingle: 'acquirer.block.successSingle',
    },
    activate: {
      header: 'acquirer.activate.header',
      messageBulk: 'acquirer.activate.messageBulk',
      successBulk: 'acquirer.activate.successBulk',
      messageSingle: 'acquirer.activate.messageSingle',
      successSingle: 'acquirer.activate.successSingle',
    },
    deactivate: {
      header: 'acquirer.deactivate.header',
      messageBulk: 'acquirer.deactivate.messageBulk',
      successBulk: 'acquirer.deactivate.successBulk',
      messageSingle: 'acquirer.deactivate.messageSingle',
      successSingle: 'acquirer.deactivate.successSingle',
    },
    relationships: {
      removeCompany: {
        header: 'acquirer.relationships.removeCompany.header',
        message: 'acquirer.relationships.removeCompany.message',
        success: 'acquirer.relationships.removeCompany.success',
      },
      removeEstablishment: {
        header: 'acquirer.relationships.removeEstablishment.header',
        message: 'acquirer.relationships.removeEstablishment.message',
        success: 'acquirer.relationships.removeEstablishment.success',
      },
    },
  },
  groups: {
    fields: {
      name: 'groups.fields.name',
      description: 'groups.fields.description',
      createdAt: 'groups.fields.createdAt',
      createdBy: 'groups.fields.createdBy',
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
      columns: {
        errorMessage: 'audit.emailLog.columns.errorMessage',
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
    tableFilters: 'common.tableFilters',
    advancedFilters: 'common.advancedFilters',
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
