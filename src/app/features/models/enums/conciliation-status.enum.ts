import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum ConciliationStatusEnum {
  NULL = 'NULL',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  DIVERGENT = 'DIVERGENT',
  RECONCILED = 'RECONCILED',
  LIQUIDATED = 'LIQUIDATED',
  NOT_RECONCILED = 'NOT_RECONCILED',
  PARTIALLY_RECONCILED = 'PARTIALLY_RECONCILED',
}

export type ConciliationStatusInput = ConciliationStatusEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, ConciliationStatusEnum> = {
  0: ConciliationStatusEnum.NULL,
  1: ConciliationStatusEnum.PENDING,
  2: ConciliationStatusEnum.RECONCILED,
  3: ConciliationStatusEnum.PARTIALLY_RECONCILED,
  4: ConciliationStatusEnum.DIVERGENT,
  5: ConciliationStatusEnum.NOT_RECONCILED,
  6: ConciliationStatusEnum.LIQUIDATED,
  7: ConciliationStatusEnum.CANCELED,
};

export function normalizeConciliationStatusEnum(
  conciliationStatus: ConciliationStatusInput,
): ConciliationStatusEnum | null {
  if (conciliationStatus == null) return null;

  if (typeof conciliationStatus === 'number') {
    return STATUS_CODE_MAP[conciliationStatus] ?? null;
  }

  const normalized = String(conciliationStatus).trim().toUpperCase();

  switch (normalized) {
    case ConciliationStatusEnum.NULL:
      return ConciliationStatusEnum.NULL;

    case ConciliationStatusEnum.PENDING:
      return ConciliationStatusEnum.PENDING;

    case ConciliationStatusEnum.RECONCILED:
      return ConciliationStatusEnum.RECONCILED;

    case ConciliationStatusEnum.PARTIALLY_RECONCILED:
      return ConciliationStatusEnum.PARTIALLY_RECONCILED;

    case ConciliationStatusEnum.DIVERGENT:
      return ConciliationStatusEnum.DIVERGENT;

    case ConciliationStatusEnum.NOT_RECONCILED:
      return ConciliationStatusEnum.NOT_RECONCILED;

    case ConciliationStatusEnum.LIQUIDATED:
      return ConciliationStatusEnum.LIQUIDATED;

    case ConciliationStatusEnum.CANCELED:
      return ConciliationStatusEnum.CANCELED;

    default:
      return null;
  }
}

export function conciliationStatusEnumSeverity(
  conciliationStatus: ConciliationStatusInput,
): CsTagTone {
  switch (normalizeConciliationStatusEnum(conciliationStatus)) {
    case ConciliationStatusEnum.PENDING:
      return 'success';

    case ConciliationStatusEnum.RECONCILED:
      return 'warn';

    case ConciliationStatusEnum.CANCELED:
      return 'orange';

    case ConciliationStatusEnum.PARTIALLY_RECONCILED:
      return 'info';

    case ConciliationStatusEnum.LIQUIDATED:
      return 'blue';

    case ConciliationStatusEnum.NOT_RECONCILED:
      return 'contrast';

    case ConciliationStatusEnum.DIVERGENT:
      return 'danger';

    default:
      return 'contrast';
  }
}

export function conciliationStatusEnumLabel(
  conciliationStatus: ConciliationStatusInput,
  i18n: I18nService,
): string {
  switch (normalizeConciliationStatusEnum(conciliationStatus)) {
    case ConciliationStatusEnum.PENDING:
      return i18n.tUi('enum.conciliationStatusEnum.pending');

    case ConciliationStatusEnum.RECONCILED:
      return i18n.tUi('enum.conciliationStatusEnum.reconciled');

    case ConciliationStatusEnum.CANCELED:
      return i18n.tUi('enum.conciliationStatusEnum.canceled');

    case ConciliationStatusEnum.PARTIALLY_RECONCILED:
      return i18n.tUi('enum.conciliationStatusEnum.partiallyReconciled');

    case ConciliationStatusEnum.LIQUIDATED:
      return i18n.tUi('enum.conciliationStatusEnum.liquidated');

    case ConciliationStatusEnum.DIVERGENT:
      return i18n.tUi('enum.conciliationStatusEnum.divergent');

    case ConciliationStatusEnum.NOT_RECONCILED:
      return i18n.tUi('enum.conciliationStatusEnum.notReconciled');

    case ConciliationStatusEnum.NULL:
      return i18n.tUi('enum.conciliationStatusEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.conciliationStatusEnum.unknown');
  }
}

export function allConciliationStatusEnum(): ConciliationStatusEnum[] {
  return [
    ConciliationStatusEnum.LIQUIDATED,
    ConciliationStatusEnum.PENDING,
    ConciliationStatusEnum.RECONCILED,
    ConciliationStatusEnum.PARTIALLY_RECONCILED,
    ConciliationStatusEnum.DIVERGENT,
    ConciliationStatusEnum.NOT_RECONCILED,
    ConciliationStatusEnum.CANCELED,
  ];
}
