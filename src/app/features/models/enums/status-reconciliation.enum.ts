import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum StatusReconciliationEnum {
  NULL = 'NULL',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  DIVERGENT = 'DIVERGENT',
  RECONCILED = 'RECONCILED',
  PARTIALLY_RECONCILED = 'PARTIALLY_RECONCILED',
}

export type CreditOrderInput = StatusReconciliationEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, StatusReconciliationEnum> = {
  0: StatusReconciliationEnum.NULL,
  1: StatusReconciliationEnum.PENDING,
  2: StatusReconciliationEnum.RECONCILED,
  3: StatusReconciliationEnum.PARTIALLY_RECONCILED,
  4: StatusReconciliationEnum.DIVERGENT,
  5: StatusReconciliationEnum.CANCELED,
};

export function normalizeStatusReconciliationEnum(
  statusReconciliation: CreditOrderInput,
): StatusReconciliationEnum | null {
  if (statusReconciliation == null) return null;

  if (typeof statusReconciliation === 'number') {
    return STATUS_CODE_MAP[statusReconciliation] ?? null;
  }

  const normalized = String(statusReconciliation).trim().toUpperCase();

  switch (normalized) {
    case StatusReconciliationEnum.NULL:
      return StatusReconciliationEnum.NULL;

    case StatusReconciliationEnum.PENDING:
      return StatusReconciliationEnum.PENDING;

    case StatusReconciliationEnum.DIVERGENT:
      return StatusReconciliationEnum.DIVERGENT;

    case StatusReconciliationEnum.RECONCILED:
      return StatusReconciliationEnum.RECONCILED;

    case StatusReconciliationEnum.PARTIALLY_RECONCILED:
      return StatusReconciliationEnum.PARTIALLY_RECONCILED;

    case StatusReconciliationEnum.CANCELED:
      return StatusReconciliationEnum.CANCELED;

    default:
      return null;
  }
}

export function statusReconciliationEnumSeverity(
  statusReconciliation: CreditOrderInput,
): CsTagTone {
  switch (normalizeStatusReconciliationEnum(statusReconciliation)) {
    case StatusReconciliationEnum.PENDING:
      return 'warn';

    case StatusReconciliationEnum.DIVERGENT:
      return 'error';

    case StatusReconciliationEnum.RECONCILED:
      return 'success';

    case StatusReconciliationEnum.PARTIALLY_RECONCILED:
      return 'blue';

    case StatusReconciliationEnum.CANCELED:
      return 'danger';

    default:
      return 'contrast';
  }
}

export function statusReconciliationEnumLabel(
  statusReconciliation: CreditOrderInput,
  i18n: I18nService,
): string {
  switch (normalizeStatusReconciliationEnum(statusReconciliation)) {
    case StatusReconciliationEnum.PENDING:
      return i18n.tUi('enum.statusReconciliationEnum.pending');

    case StatusReconciliationEnum.DIVERGENT:
      return i18n.tUi('enum.statusReconciliationEnum.divergent');

    case StatusReconciliationEnum.RECONCILED:
      return i18n.tUi('enum.statusReconciliationEnum.reconciled');

    case StatusReconciliationEnum.PARTIALLY_RECONCILED:
      return i18n.tUi('enum.statusReconciliationEnum.partiallyReconciled');

    case StatusReconciliationEnum.CANCELED:
      return i18n.tUi('enum.statusReconciliationEnum.canceled');

    case StatusReconciliationEnum.NULL:
      return i18n.tUi('enum.statusReconciliationEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.statusReconciliationEnum.unknown');
  }
}

export function allStatusReconciliationEnum(): StatusReconciliationEnum[] {
  return [
    StatusReconciliationEnum.RECONCILED,
    StatusReconciliationEnum.PARTIALLY_RECONCILED,
    StatusReconciliationEnum.PENDING,
    StatusReconciliationEnum.DIVERGENT,
    StatusReconciliationEnum.CANCELED,
  ];
}
