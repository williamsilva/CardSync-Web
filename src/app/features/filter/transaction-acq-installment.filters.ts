import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { CaptureEnum } from '@models/enums/capture.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { PaymentStatusEnum } from '@models/enums/payment-status.enum';
import { TransactionStatusEnum } from '@models/enums/transaction-status.enum';

export type TransactionsAcqInstallmentFiltersState = {
  tid: string;
  cvNsu: string;
  authorization: string;

  grossValueEnd: number | null;
  liquidValueEnd: number | null;
  grossValueStart: number | null;
  discountValueEnd: number | null;
  liquidValueStart: number | null;
  adjustmentValueEnd: number | null;
  discountValueStart: number | null;
  adjustmentValueStart: number | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  capture: CaptureEnum[] | null;
  establishments: string[] | null;
  modality: ModalityEnum[] | null;
  paymentStatus: PaymentStatusEnum[] | null;
  transactionStatus: TransactionStatusEnum[] | null;

  periodSaleDate: PeriodEnum | null;
  saleDate: string | string[] | null;

  periodPaymentDate: PeriodEnum | null;
  paymentDate: string | string[] | null;

  periodExpectedPaymentDate: PeriodEnum | null;
  expectedPaymentDate: string | string[] | null;
};

export type TransactionsAcqInstallmentAdvancedFilters =
  Partial<TransactionsAcqInstallmentFiltersState>;

export type TransactionsAcqInstallmentAdvancedFilterSignals = {
  [K in keyof TransactionsAcqInstallmentFiltersState]: WritableSignal<
    TransactionsAcqInstallmentFiltersState[K]
  >;
};

export function createEmptyTransactionsAcqInstallmentFiltersState(): TransactionsAcqInstallmentFiltersState {
  return {
    tid: '',
    cvNsu: '',
    authorization: '',

    grossValueEnd: null,
    liquidValueEnd: null,
    grossValueStart: null,
    discountValueEnd: null,
    liquidValueStart: null,
    adjustmentValueEnd: null,
    discountValueStart: null,
    adjustmentValueStart: null,

    flags: null,
    capture: null,
    modality: null,
    acquirers: null,
    companies: null,
    paymentStatus: null,
    establishments: null,
    transactionStatus: null,

    saleDate: null,
    periodSaleDate: null,

    paymentDate: null,
    periodPaymentDate: null,

    expectedPaymentDate: null,
    periodExpectedPaymentDate: null,
  };
}

export function resetTransactionsAcqInstallmentAdvancedFilters(
  filters: TransactionsAcqInstallmentAdvancedFilterSignals,
): void {
  const empty = createEmptyTransactionsAcqInstallmentFiltersState();

  filters.tid.set(empty.tid);
  filters.cvNsu.set(empty.cvNsu);
  filters.paymentStatus.set(empty.paymentStatus);
  filters.authorization.set(empty.authorization);
  filters.grossValueEnd.set(empty.grossValueEnd);
  filters.liquidValueEnd.set(empty.liquidValueEnd);
  filters.grossValueStart.set(empty.grossValueStart);
  filters.discountValueEnd.set(empty.discountValueEnd);
  filters.liquidValueStart.set(empty.liquidValueStart);
  filters.adjustmentValueEnd.set(empty.adjustmentValueEnd);
  filters.discountValueStart.set(empty.discountValueStart);
  filters.adjustmentValueStart.set(empty.adjustmentValueStart);

  filters.flags.set(empty.flags);
  filters.capture.set(empty.capture);
  filters.modality.set(empty.modality);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);
  filters.transactionStatus.set(empty.transactionStatus);

  filters.saleDate.set(empty.saleDate);
  filters.periodSaleDate.set(empty.periodSaleDate);

  filters.paymentDate.set(empty.paymentDate);
  filters.periodPaymentDate.set(empty.periodPaymentDate);

  filters.expectedPaymentDate.set(empty.expectedPaymentDate);
  filters.periodExpectedPaymentDate.set(empty.periodExpectedPaymentDate);
}
