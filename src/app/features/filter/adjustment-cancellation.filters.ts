import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { AdjustmentReasonEnum } from '@models/enums/adjustment-reason.enum';
import { AdjustmentStatusEnum } from '@models/enums/adjustment-status.enum';

export type AdjustmentCancellationFiltersState = {
  saleDate: string | string[] | null;
  periodSaleDate: PeriodEnum | null;

  adjustmentDate: string | string[] | null;
  periodAdjustmentDate: PeriodEnum | null;

  creditDate: string | string[] | null;
  periodCreditDate: PeriodEnum | null;

  authorization: string | null;
  cvNsu: string | null;

  valueStart: number | null;
  valueEnd: number | null;
  adjustmentValueStart: number | null;
  adjustmentValueEnd: number | null;

  adjustmentReason: AdjustmentReasonEnum[] | null;
  status: AdjustmentStatusEnum[] | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;
};

export type CancellationAdvancedFilters = Partial<AdjustmentCancellationFiltersState>;

export type CancellationAdvancedFilterSignals = {
  [K in keyof AdjustmentCancellationFiltersState]: WritableSignal<
    AdjustmentCancellationFiltersState[K]
  >;
};

export function createEmptyAdjustmentCancellationFiltersState(): AdjustmentCancellationFiltersState {
  return {
    saleDate: null,
    periodSaleDate: null,

    adjustmentDate: null,
    periodAdjustmentDate: null,

    creditDate: null,
    periodCreditDate: null,

    authorization: null,
    cvNsu: null,

    valueStart: null,
    valueEnd: null,
    adjustmentValueStart: null,
    adjustmentValueEnd: null,

    adjustmentReason: null,
    status: null,

    flags: null,
    acquirers: null,
    companies: null,
    establishments: null,
  };
}

export function resetCancellationAdvancedFilters(filters: CancellationAdvancedFilterSignals): void {
  const empty = createEmptyAdjustmentCancellationFiltersState();

  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.saleDate.set(empty.saleDate);
  filters.periodSaleDate.set(empty.periodSaleDate);

  filters.adjustmentDate.set(empty.adjustmentDate);
  filters.periodAdjustmentDate.set(empty.periodAdjustmentDate);

  filters.creditDate.set(empty.creditDate);
  filters.periodCreditDate.set(empty.periodCreditDate);

  filters.authorization.set(empty.authorization);
  filters.cvNsu.set(empty.cvNsu);

  filters.valueStart.set(empty.valueStart);
  filters.valueEnd.set(empty.valueEnd);
  filters.adjustmentValueStart.set(empty.adjustmentValueStart);
  filters.adjustmentValueEnd.set(empty.adjustmentValueEnd);

  filters.adjustmentReason.set(empty.adjustmentReason);
  filters.status.set(empty.status);
}
