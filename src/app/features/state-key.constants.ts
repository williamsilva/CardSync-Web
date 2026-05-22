export const STATE_KEY = {
  CARDSYNC: {
    FILE: {
      TABLE: {
        ROWS: {
          V1: 'cardsync.file.table.rows',
        },
        STATE: {
          V1: 'cardsync.file.table.state.v1',
        },
      },

      FILTERS: {
        V1: 'cardsync.file.filters.v1',
      },
    },
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
    MISSING: {
      ACQ: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.missing.acq.table.rows',
          },
          STATE: {
            V1: 'cardsync.missing.acq.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.missing.acq.filters.v1',
        },
      },
      ERP: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.missing.erp.table.rows',
          },
          STATE: {
            V1: 'cardsync.missing.erp.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.missing.erp.filters.v1',
        },
      },
      OTHER_DIVERGENCES: {
        TABLE: {
          ROWS: {
            V1: 'cardsync.missing.other-divergences.table.rows',
          },
          STATE: {
            V1: 'cardsync.missing.other-divergences.table.state.v1',
          },
        },

        FILTERS: {
          V1: 'cardsync.missing.other-divergences.filters.v1',
        },
      },
    },
  },
};
