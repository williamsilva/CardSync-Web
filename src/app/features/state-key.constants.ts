export const STATE_KEY = {
  CARDSYNC: {
    ACQ: {
      SALES: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.acq.sales.table.rows',
          },
          STATE: {
            V1: 'cardsync.acq.sales.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.acq.sales.filters.v1',
        },
      },
      INSTALLMENT: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.acq.installment.table.rows',
          },
          STATE: {
            V1: 'cardsync.acq.installment.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.acq.installment.filters.v1',
        },
      },
    },
    ERP: {
      SALES: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.erp.sales.table.rows',
          },
          STATE: {
            V1: 'cardsync.erp.sales.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.erp.sales.filters.v1',
        },
      },
      INSTALLMENT: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.erp.installment.table.rows',
          },
          STATE: {
            V1: 'cardsync.erp.installment.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.erp.installment.filters.v1',
        },
      },
    },
    ANTICIPATION: {
      TABLE: {
        ROWS: {
          V1: 'cardsync.anticipation.table.rows',
        },
        STATE: {
          V1: 'cardsync.anticipation.table.state.v1',
        },
      },

      FILTERS: {
        V1: 'cardsync.anticipation.filters.v1',
      },
    },
    CREDIT_ORDER: {
      TABLE: {
        ROWS: {
          V1: 'cardsync.credit_order.table.rows',
        },
        STATE: {
          V1: 'cardsync.credit_order.table.state.v1',
        },
      },

      FILTERS: {
        V1: 'cardsync.credit_order.filters.v1',
      },
    },
    SALES_SUMMARY: {
      TABLE: {
        ROWS: {
          V1: 'cardsync.sales_summary.table.rows',
        },
        STATE: {
          V1: 'cardsync.sales_summary.table.state.v1',
        },
      },

      FILTERS: {
        V1: 'cardsync.sales_summary.filters.v1',
      },
    },
    /* Extratos bancarios */
    BANK_STATEMENT: {
      TABLE: {
        ROWS: {
          V1: 'cardsync.bank_statement.table.rows',
        },
        STATE: {
          V1: 'cardsync.bank_statement.table.state.v1',
        },
      },

      FILTERS: {
        V1: 'cardsync.bank_statement.filters.v1',
      },
    },
    /* Arquivos Porcessados */
    PROCESSED_FILES: {
      FILES: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.processed_files.files.table.rows.v1',
          },
          STATE: {
            V1: 'cardsync.processed_files.files.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.processed_files.files.filters.v1',
        },
      },
      DASHBOARD: {
        TABLE: {
          ROWS: { V1: 'cardsync.file_processing_dashboard.table.rows' },
          STATE: { V1: 'cardsync.file_processing_dashboard.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.file_processing_dashboard.filters.v1' },
      },
    },
    /* Ajustamentos */
    ADJUSTMENT: {
      CHARGEBACK_REQUESTS: {
        TABLE: {
          ROWS: { V1: 'cardsync.adjustment.chargeback-requests.table.rows' },
          STATE: { V1: 'cardsync.adjustment.chargeback-requests.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.adjustment.chargeback-requests.filters.v1' },
      },
      CANCELLATION: {
        TABLE: {
          ROWS: { V1: 'cardsync.adjustment.cancellation.table.rows' },
          STATE: { V1: 'cardsync.adjustment.cancellation.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.adjustment.cancellation.filters.v1' },
      },
      TARIFFS: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.adjustment.tariffs.table.rows',
          },
          STATE: {
            V1: 'cardsync.adjustment.tariffs.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.adjustment.tariffs.filters.v1',
        },
      },
    },
    /* Cadastros */
    REGISTER: {
      HOLIDAYS: {
        TABLE: {
          ROWS: { V1: 'cardsync.register.holidays.table.rows' },
          STATE: { V1: 'cardsync.register.holidays.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.register.holidays.filters.v1' },
      },
      BANKS: {
        TABLE: {
          ROWS: { V1: 'cardsync.register.banks.table.rows' },
          STATE: { V1: 'cardsync.register.banks.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.register.banks.filters.v1' },
      },
      BANKING_DOMICILE: {
        TABLE: {
          ROWS: { V1: 'cardsync.register.banking-domicile.table.rows' },
          STATE: { V1: 'cardsync.register.banking-domicile.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.register.banking-domicile.filters.v1' },
      },
      COMPANY: {
        TABLE: {
          ROWS: { V1: 'company.table.rows' },
          STATE: { V1: 'cardsync.company.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.company.filters.v1' },
      },
      ACQUIRER: {
        TABLE: {
          ROWS: { V1: 'acquirer.table.rows' },
          STATE: { V1: 'cardsync.acquirer.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.acquirer.filters.v1' },
      },
      CONTRACT: {
        TABLE: {
          ROWS: { V1: 'contract.table.rows' },
          STATE: { V1: 'cardsync.contract.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.contract.filters.v1' },
      },
      FLAG: {
        TABLE: {
          ROWS: { V1: 'flag.table.rows' },
          STATE: { V1: 'cardsync.flag.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.flag.filters.v1' },
      },
      ESTABLISHMENT: {
        TABLE: {
          ROWS: { V1: 'establishment.table.rows' },
          STATE: { V1: 'cardsync.establishment.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.establishment.filters.v1' },
      },
      NO_FILE_DAY: {
        TABLE: {
          ROWS: { V1: 'cardsync.register.no-file-day.table.rows' },
          STATE: { V1: 'cardsync.register.no-file-day.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.register.no-file-day.filters.v1' },
      },
    },
    /* Segurança */
    SECURITY: {
      USERS: {
        TABLE: {
          ROWS: { V1: 'users.table.rows' },
          STATE: { V1: 'cardsync.users.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.users.filters.v1' },
      },
      GROUPS: {
        TABLE: {
          ROWS: { V1: 'groups.table.rows' },
          STATE: { V1: 'cardsync.groups.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.groups.filters.v1' },
      },
    },
    /* Auditoria */
    AUDIT: {
      EMAIL_LOGS: {
        TABLE: {
          ROWS: { V1: 'audit.emailLog.table.rows' },
          STATE: { V1: 'cardsync.audit.emailLog.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.audit.mailLog.filters.v1' },
      },
    },
    /* Conciliação */
    CONCILIATION: {
      MANUAL_CREDIT_ORDER: {
        TABLE: {
          ROWS: { V1: 'cardsync.conciliation.manual-credit-order.table.rows' },
          STATE: { V1: 'cardsync.conciliation.manual-credit-order.table.state.v1' },
        },
        FILTERS: { V1: 'cardsync.conciliation.manual-credit-order.filters.v1' },
      },
      MANUAL_BANK_STATEMENT: {
        FORM: { V1: 'cardsync.conciliation.manual-bank-statement.form.v1' },
      },
      FEES: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.conciliation.contractAudit.table.rows',
          },
          STATE: {
            V1: 'cardsync.conciliation.contractAudit.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.conciliation.contractAudit.filters.v1',
        },
      },
      MISSING: {
        ACQ: {
          TABLE: {
            ROWS: {
              V1: 'cardsync.conciliation.missing.acq.table.rows',
            },
            STATE: {
              V1: 'cardsync.conciliation.missing.acq.table.state.v1',
            },
          },

          FILTERS: {
            V1: 'cardsync.conciliation.missing.acq.filters.v1',
          },
        },
        ERP: {
          TABLE: {
            ROWS: {
              V1: 'cardsync.conciliation.missing.erp.table.rows',
            },
            STATE: {
              V1: 'cardsync.conciliation.missing.erp.table.state.v1',
            },
          },

          FILTERS: {
            V1: 'cardsync.conciliation.missing.erp.filters.v1',
          },
        },
        OTHER_DIVERGENCES: {
          TABLE: {
            ROWS: {
              V1: 'cardsync.conciliation.missing.other-divergences.table.rows',
            },
            STATE: {
              V1: 'cardsync.conciliation.missing.other-divergences.table.state.v1',
            },
          },

          FILTERS: {
            V1: 'cardsync.conciliation.missing.other-divergences.filters.v1',
          },
        },
      },
    },
  },
};
