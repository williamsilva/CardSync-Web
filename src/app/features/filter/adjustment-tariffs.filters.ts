import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { AdjustmentReasonEnum } from '@models/enums/adjustment-reason.enum';
import { AdjustmentStatusEnum } from '@models/enums/adjustment-status.enum';

export type AdjustmentTariffsFiltersState = {
  adjustmentDate: string | string[] | null;
  periodAdjustmentDate: PeriodEnum | null;

  creditDate: string | string[] | null;
  periodCreditDate: PeriodEnum | null;

  rvNumberAdjustment: string;

  adjustmentReason: AdjustmentReasonEnum[] | null;
  status: AdjustmentStatusEnum[] | null;

  adjustmentValueStart: number | null;
  adjustmentValueEnd: number | null;

  flags: string[] | null;
  acquirers: string[] | null;
  companies: string[] | null;
  establishments: string[] | null;
};

export type AdjustmentAdvancedFilters = Partial<AdjustmentTariffsFiltersState>;

export type AdjustmentAdvancedFilterSignals = {
  [K in keyof AdjustmentTariffsFiltersState]: WritableSignal<AdjustmentTariffsFiltersState[K]>;
};

export function createEmptyAdjustmentTariffsFiltersState(): AdjustmentTariffsFiltersState {
  return {
    adjustmentDate: null,
    periodAdjustmentDate: null,

    creditDate: null,
    periodCreditDate: null,

    rvNumberAdjustment: '',

    adjustmentReason: null,
    status: null,

    flags: null,
    acquirers: null,
    companies: null,
    establishments: null,

    adjustmentValueStart: null,
    adjustmentValueEnd: null,
  };
}

export function resetAdjustmentAdvancedFilters(filters: AdjustmentAdvancedFilterSignals): void {
  const empty = createEmptyAdjustmentTariffsFiltersState();

  filters.flags.set(empty.flags);
  filters.acquirers.set(empty.acquirers);
  filters.companies.set(empty.companies);
  filters.establishments.set(empty.establishments);

  filters.adjustmentDate.set(empty.adjustmentDate);
  filters.periodAdjustmentDate.set(empty.periodAdjustmentDate);

  filters.creditDate.set(empty.creditDate);
  filters.periodCreditDate.set(empty.periodCreditDate);

  filters.rvNumberAdjustment.set(empty.rvNumberAdjustment);

  filters.adjustmentReason.set(empty.adjustmentReason);
  filters.status.set(empty.status);

  filters.adjustmentValueStart.set(empty.adjustmentValueStart);
  filters.adjustmentValueEnd.set(empty.adjustmentValueEnd);
}
