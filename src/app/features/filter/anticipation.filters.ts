import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { StatusTransactionEnum } from '@models/enums/status-transaction.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';

export type AnticipationFiltersState = {
  rvNumber: number | null;

  periodReleaseDate: PeriodEnum | null;
  releaseDate: string | string[] | null;

  modality: ModalityEnum[] | null;
  transactionsStatus: StatusTransactionEnum[] | null;
  statusPaymentBank: StatusPaymentBankEnum[] | null;

  flags: string[] | null;
  banks: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;

  grossValueStart: number | null;
  grossValueEnd: number | null;
  discountRateValueStart: number | null;
  discountRateValueEnd: number | null;
  releaseValueStart: number | null;
  releaseValueEnd: number | null;
  originalCreditValueStart: number | null;
  originalCreditValueEnd: number | null;
  advanceDiscountValueStart: number | null;
  advanceDiscountValueEnd: number | null;
};

export type AnticipationAdvancedFilters = Partial<AnticipationFiltersState>;

export type AnticipationAdvancedFilterSignals = {
  [K in keyof AnticipationFiltersState]: WritableSignal<AnticipationFiltersState[K]>;
};

export function createEmptyAnticipationFiltersState(): AnticipationFiltersState {
  return {
    rvNumber: null,

    periodReleaseDate: null,
    releaseDate: null,

    modality: null,
    transactionsStatus: null,
    statusPaymentBank: null,

    flags: null,
    banks: null,
    acquirers: null,
    companies: null,
    establishments: null,

    grossValueStart: null,
    grossValueEnd: null,
    discountRateValueStart: null,
    discountRateValueEnd: null,
    releaseValueStart: null,
    releaseValueEnd: null,
    originalCreditValueStart: null,
    originalCreditValueEnd: null,
    advanceDiscountValueStart: null,
    advanceDiscountValueEnd: null,
  };
}

export function resetAnticipationAdvancedFilters(filters: AnticipationAdvancedFilterSignals): void {
  const empty = createEmptyAnticipationFiltersState();

  filters.banks.set(empty.banks);
  filters.flags.set(empty.flags);
  filters.rvNumber.set(empty.rvNumber);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.releaseDate.set(empty.releaseDate);
  filters.periodReleaseDate.set(empty.periodReleaseDate);

  filters.modality.set(empty.modality);
  filters.transactionsStatus.set(empty.transactionsStatus);
  filters.statusPaymentBank.set(empty.statusPaymentBank);

  filters.grossValueStart.set(empty.grossValueStart);
  filters.grossValueEnd.set(empty.grossValueEnd);
  filters.discountRateValueStart.set(empty.discountRateValueStart);
  filters.discountRateValueEnd.set(empty.discountRateValueEnd);
  filters.releaseValueStart.set(empty.releaseValueStart);
  filters.releaseValueEnd.set(empty.releaseValueEnd);
  filters.originalCreditValueStart.set(empty.originalCreditValueStart);
  filters.originalCreditValueEnd.set(empty.originalCreditValueEnd);
  filters.advanceDiscountValueStart.set(empty.advanceDiscountValueStart);
  filters.advanceDiscountValueEnd.set(empty.advanceDiscountValueEnd);
}
