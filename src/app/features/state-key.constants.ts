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
    /* Conciliação */
    CONCILIATION: {
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
