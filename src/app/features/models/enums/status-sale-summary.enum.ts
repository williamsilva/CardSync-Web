import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum StatusSaleSummaryEnum {
  NULL = 'NULL',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
  CANCELED = 'CANCELED',
  NOT_RECONCILED = 'NOT_RECONCILED',
  MANUALLY_RECONCILED = 'MANUALLY_RECONCILED',
  PARTIALLY_RECONCILED = 'PARTIALLY_RECONCILED',
  AUTOMATICALLY_RECONCILED = 'AUTOMATICALLY_RECONCILED',
}

export type CreditOrderInput = StatusSaleSummaryEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, StatusSaleSummaryEnum> = {
  0: StatusSaleSummaryEnum.NULL,
  1: StatusSaleSummaryEnum.PENDING,
  2: StatusSaleSummaryEnum.AUTOMATICALLY_RECONCILED,
  3: StatusSaleSummaryEnum.MANUALLY_RECONCILED,
  4: StatusSaleSummaryEnum.NOT_RECONCILED,
  5: StatusSaleSummaryEnum.CANCELED,
  6: StatusSaleSummaryEnum.DELETED,
  7: StatusSaleSummaryEnum.PARTIALLY_RECONCILED,
};

export function normalizeStatusSaleSummaryEnum(
  saleSummary: CreditOrderInput,
): StatusSaleSummaryEnum | null {
  if (saleSummary == null) return null;

  if (typeof saleSummary === 'number') {
    return STATUS_CODE_MAP[saleSummary] ?? null;
  }

  const normalized = String(saleSummary).trim().toUpperCase();

  switch (normalized) {
    case StatusSaleSummaryEnum.NULL:
      return StatusSaleSummaryEnum.NULL;

    case StatusSaleSummaryEnum.PENDING:
      return StatusSaleSummaryEnum.PENDING;

    case StatusSaleSummaryEnum.MANUALLY_RECONCILED:
      return StatusSaleSummaryEnum.MANUALLY_RECONCILED;

    case StatusSaleSummaryEnum.AUTOMATICALLY_RECONCILED:
      return StatusSaleSummaryEnum.AUTOMATICALLY_RECONCILED;

    case StatusSaleSummaryEnum.NOT_RECONCILED:
      return StatusSaleSummaryEnum.NOT_RECONCILED;

    case StatusSaleSummaryEnum.DELETED:
      return StatusSaleSummaryEnum.DELETED;

    case StatusSaleSummaryEnum.CANCELED:
      return StatusSaleSummaryEnum.CANCELED;

    case StatusSaleSummaryEnum.PARTIALLY_RECONCILED:
      return StatusSaleSummaryEnum.PARTIALLY_RECONCILED;

    default:
      return null;
  }
}

export function saleSummaryEnumSeverity(saleSummary: CreditOrderInput): CsTagTone {
  switch (normalizeStatusSaleSummaryEnum(saleSummary)) {
    case StatusSaleSummaryEnum.PENDING:
      return 'warn';

    case StatusSaleSummaryEnum.AUTOMATICALLY_RECONCILED:
      return 'success';

    case StatusSaleSummaryEnum.CANCELED:
      return 'orange';

    case StatusSaleSummaryEnum.MANUALLY_RECONCILED:
      return 'info';

    case StatusSaleSummaryEnum.DELETED:
      return 'danger';

    case StatusSaleSummaryEnum.NOT_RECONCILED:
      return 'blue';

    case StatusSaleSummaryEnum.PARTIALLY_RECONCILED:
      return 'money';

    default:
      return 'contrast';
  }
}

export function saleSummaryEnumLabel(saleSummary: CreditOrderInput, i18n: I18nService): string {
  switch (normalizeStatusSaleSummaryEnum(saleSummary)) {
    /* case StatusSaleSummaryEnum.PENDING:
      return i18n.tUi('enum.saleSummaryEnum.pending');

    case StatusSaleSummaryEnum.AUTOMATICALLY_RECONCILED:
      return i18n.tUi('enum.saleSummaryEnum.reconciledAutomatically');

    case StatusSaleSummaryEnum.CANCELED:
      return i18n.tUi('enum.saleSummaryEnum.canceled');

    case StatusSaleSummaryEnum.MANUALLY_RECONCILED:
      return i18n.tUi('enum.saleSummaryEnum.manuallyReconciled');

    case StatusSaleSummaryEnum.DELETED:
      return i18n.tUi('enum.saleSummaryEnum.deleted');

    case StatusSaleSummaryEnum.NOT_RECONCILED:
      return i18n.tUi('enum.saleSummaryEnum.notReconciled');

    case StatusSaleSummaryEnum.PARTIALLY_RECONCILED:
      return i18n.tUi('enum.saleSummaryEnum.partiallyReconciled');

      */
    case StatusSaleSummaryEnum.NULL:
      return i18n.tUi('enum.saleSummaryEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.saleSummaryEnum.unknown');
  }
}

export function allStatusSaleSummaryEnum(): StatusSaleSummaryEnum[] {
  return [
    StatusSaleSummaryEnum.AUTOMATICALLY_RECONCILED,
    StatusSaleSummaryEnum.MANUALLY_RECONCILED,
    StatusSaleSummaryEnum.PARTIALLY_RECONCILED,
    StatusSaleSummaryEnum.PENDING,
    StatusSaleSummaryEnum.NOT_RECONCILED,
    StatusSaleSummaryEnum.DELETED,
    StatusSaleSummaryEnum.CANCELED,
  ];
}
