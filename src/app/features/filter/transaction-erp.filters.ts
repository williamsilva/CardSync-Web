import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { CaptureEnum } from '@models/enums/capture.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { StatusTransactionEnum } from '@models/enums/status-transaction.enum';
import { StatusPaymentBankEnum } from '../models/enums/status-payment-bank.enum';

export type TransactionsErpFiltersState = {
  tid: string;
  cvNsu: string;
  machine: string;
  cardNumber: string;
  authorization: string;

  capture: CaptureEnum[] | null;
  modality: ModalityEnum[] | null;
  statusPaymentBank: StatusPaymentBankEnum[] | null;
  statusTransaction: StatusTransactionEnum[] | null;

  grossValueEnd: number | null;
  liquidValueEnd: number | null;
  grossValueStart: number | null;
  liquidValueStart: number | null;
  discountValueEnd: number | null;
  discountValueStart: number | null;
  adjustmentValueEnd: number | null;
  adjustmentValueStart: number | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  periodSaleDate: PeriodEnum | null;
  saleDate: string | string[] | null;

  periodPaymentDate: PeriodEnum | null;
  paymentDate: string | string[] | null;

  periodExpectedPaymentDate: PeriodEnum | null;
  expectedPaymentDate: string | string[] | null;

  periodConciliationDate: PeriodEnum | null;
  conciliationDate: string | string[] | null;
};

export type TransactionsErpAdvancedFilters = Partial<TransactionsErpFiltersState>;

export type TransactionsErpAdvancedFilterSignals = {
  [K in keyof TransactionsErpFiltersState]: WritableSignal<TransactionsErpFiltersState[K]>;
};

export function createEmptyTransactionsErpFiltersState(): TransactionsErpFiltersState {
  return {
    tid: '',
    cvNsu: '',
    machine: '',
    cardNumber: '',
    authorization: '',

    capture: null,
    modality: null,
    acquirers: null,
    statusPaymentBank: null,
    statusTransaction: null,

    grossValueEnd: null,
    liquidValueEnd: null,
    grossValueStart: null,
    liquidValueStart: null,
    discountValueEnd: null,
    discountValueStart: null,
    adjustmentValueEnd: null,
    adjustmentValueStart: null,

    flags: null,
    companies: null,
    establishments: null,

    saleDate: null,
    periodSaleDate: null,

    paymentDate: null,
    periodPaymentDate: null,

    expectedPaymentDate: null,
    periodExpectedPaymentDate: null,

    conciliationDate: null,
    periodConciliationDate: null,
  };
}

export function resetTransactionsErpAdvancedFilters(
  filters: TransactionsErpAdvancedFilterSignals,
): void {
  const empty = createEmptyTransactionsErpFiltersState();

  filters.tid.set(empty.tid);
  filters.cvNsu.set(empty.cvNsu);
  filters.machine.set(empty.machine);
  filters.cardNumber.set(empty.cardNumber);
  filters.authorization.set(empty.authorization);

  filters.capture.set(empty.capture);
  filters.modality.set(empty.modality);
  filters.acquirers.set(empty.acquirers);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
  filters.statusTransaction.set(empty.statusTransaction);

  filters.grossValueEnd.set(empty.grossValueEnd);
  filters.liquidValueEnd.set(empty.liquidValueEnd);
  filters.grossValueStart.set(empty.grossValueStart);
  filters.liquidValueStart.set(empty.liquidValueStart);
  filters.discountValueEnd.set(empty.discountValueEnd);
  filters.discountValueStart.set(empty.discountValueStart);
  filters.adjustmentValueEnd.set(empty.adjustmentValueEnd);
  filters.adjustmentValueStart.set(empty.adjustmentValueStart);

  filters.flags.set(empty.flags);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.periodSaleDate.set(empty.periodSaleDate);
  filters.saleDate.set(empty.saleDate);

  filters.periodPaymentDate.set(empty.periodPaymentDate);
  filters.paymentDate.set(empty.paymentDate);

  filters.periodExpectedPaymentDate.set(empty.periodExpectedPaymentDate);
  filters.expectedPaymentDate.set(empty.expectedPaymentDate);

  filters.periodConciliationDate.set(empty.periodConciliationDate);
  filters.conciliationDate.set(empty.conciliationDate);
}
