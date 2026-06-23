import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { ModalityEnum } from '@models/enums/modality.enum';
import { StatusPaymentBankEnum } from '@models/enums/status-payment-bank.enum';
import { StatusReconciliationEnum } from '@models/enums/status-reconciliation.enum';

export type CreditOrderFiltersState = {
  periodRvDate: PeriodEnum | null;
  rvDate: string | string[] | null;

  periodReleaseDate: PeriodEnum | null;
  releaseDate: string | string[] | null;

  periodCreditOrderDate: PeriodEnum | null;
  creditOrderDate: string | string[] | null;

  rvNumber: string | null;

  modality: ModalityEnum[] | null;

  grossValueEnd: number | null;
  grossValueStart: number | null;

  discountValueEnd: number | null;
  discountValueStart: number | null;

  liquidValueEnd: number | null;
  liquidValueStart: number | null;

  salesSummaryStatus: StatusReconciliationEnum[] | null;
  statusPaymentBank: StatusPaymentBankEnum[] | null;

  flags: string[] | null;
  banks: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;
};

export type CreditOrderAdvancedFilters = Partial<CreditOrderFiltersState>;

export type CreditOrderAdvancedFilterSignals = {
  [K in keyof CreditOrderFiltersState]: WritableSignal<CreditOrderFiltersState[K]>;
};

export function createEmptyCreditOrderFiltersState(): CreditOrderFiltersState {
  return {
    periodRvDate: null,
    rvDate: null,

    periodReleaseDate: null,
    releaseDate: null,

    periodCreditOrderDate: null,
    creditOrderDate: null,

    rvNumber: null,

    modality: null,

    grossValueStart: null,
    grossValueEnd: null,
    discountValueStart: null,
    discountValueEnd: null,
    liquidValueStart: null,
    liquidValueEnd: null,

    salesSummaryStatus: null,
    statusPaymentBank: null,

    flags: null,
    banks: null,
    acquirers: null,
    companies: null,
    establishments: null,
  };
}

export function resetCreditOrderAdvancedFilters(filters: CreditOrderAdvancedFilterSignals): void {
  const empty = createEmptyCreditOrderFiltersState();

  filters.banks.set(empty.banks);
  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.rvDate.set(empty.rvDate);
  filters.periodRvDate.set(empty.periodRvDate);

  filters.releaseDate.set(empty.releaseDate);
  filters.periodReleaseDate.set(empty.periodReleaseDate);

  filters.creditOrderDate.set(empty.creditOrderDate);
  filters.periodCreditOrderDate.set(empty.periodCreditOrderDate);

  filters.rvNumber.set(empty.rvNumber);

  filters.modality.set(empty.modality);

  filters.grossValueStart.set(empty.grossValueStart);
  filters.grossValueEnd.set(empty.grossValueEnd);
  filters.discountValueStart.set(empty.discountValueStart);
  filters.discountValueEnd.set(empty.discountValueEnd);
  filters.liquidValueStart.set(empty.liquidValueStart);
  filters.liquidValueEnd.set(empty.liquidValueEnd);

  filters.salesSummaryStatus.set(empty.salesSummaryStatus);
  filters.statusPaymentBank.set(empty.statusPaymentBank);
}
