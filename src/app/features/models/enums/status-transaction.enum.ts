import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum StatusTransactionEnum {
  NULL = 'NULL',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
  CANCELED = 'CANCELED',
  MANUALLY_RECONCILED = 'MANUALLY_RECONCILED',
  AUTOMATICALLY_RECONCILED = 'AUTOMATICALLY_RECONCILED',
}

export type StatusTransactionInput = StatusTransactionEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, StatusTransactionEnum> = {
  0: StatusTransactionEnum.NULL,
  1: StatusTransactionEnum.PENDING,
  2: StatusTransactionEnum.AUTOMATICALLY_RECONCILED,
  3: StatusTransactionEnum.MANUALLY_RECONCILED,
  4: StatusTransactionEnum.DELETED,
  5: StatusTransactionEnum.CANCELED,
};

export function normalizeStatusTransactionEnum(
  statusTransaction: StatusTransactionInput,
): StatusTransactionEnum | null {
  if (statusTransaction == null) return null;

  if (typeof statusTransaction === 'number') {
    return STATUS_CODE_MAP[statusTransaction] ?? null;
  }

  const normalized = String(statusTransaction).trim().toUpperCase();

  switch (normalized) {
    case StatusTransactionEnum.NULL:
      return StatusTransactionEnum.NULL;

    case StatusTransactionEnum.PENDING:
      return StatusTransactionEnum.PENDING;

    case StatusTransactionEnum.MANUALLY_RECONCILED:
      return StatusTransactionEnum.MANUALLY_RECONCILED;

    case StatusTransactionEnum.AUTOMATICALLY_RECONCILED:
      return StatusTransactionEnum.AUTOMATICALLY_RECONCILED;

    case StatusTransactionEnum.DELETED:
      return StatusTransactionEnum.DELETED;

    case StatusTransactionEnum.CANCELED:
      return StatusTransactionEnum.CANCELED;

    default:
      return null;
  }
}

export function statusTransactionEnumSeverity(
  statusTransaction: StatusTransactionInput,
): CsTagTone {
  switch (normalizeStatusTransactionEnum(statusTransaction)) {
    case StatusTransactionEnum.PENDING:
      return 'warn';

    case StatusTransactionEnum.AUTOMATICALLY_RECONCILED:
      return 'success';

    case StatusTransactionEnum.CANCELED:
      return 'orange';

    case StatusTransactionEnum.MANUALLY_RECONCILED:
      return 'info';

    case StatusTransactionEnum.DELETED:
      return 'danger';

    default:
      return 'contrast';
  }
}

export function statusTransactionEnumLabel(
  statusTransaction: StatusTransactionInput,
  i18n: I18nService,
): string {
  switch (normalizeStatusTransactionEnum(statusTransaction)) {
    case StatusTransactionEnum.PENDING:
      return i18n.tUi('enum.statusTransactionEnum.pending');

    case StatusTransactionEnum.AUTOMATICALLY_RECONCILED:
      return i18n.tUi('enum.statusTransactionEnum.reconciledAutomatically');

    case StatusTransactionEnum.CANCELED:
      return i18n.tUi('enum.statusTransactionEnum.canceled');

    case StatusTransactionEnum.MANUALLY_RECONCILED:
      return i18n.tUi('enum.statusTransactionEnum.manuallyReconciled');

    case StatusTransactionEnum.DELETED:
      return i18n.tUi('enum.statusTransactionEnum.deleted');

    case StatusTransactionEnum.NULL:
      return i18n.tUi('enum.statusTransactionEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.statusTransactionEnum.unknown');
  }
}

export function installmentTooltipStatusLabel(
  statusTransaction: StatusTransactionInput,
  i18n: I18nService,
): string {
  switch (normalizeStatusTransactionEnum(statusTransaction)) {
    case StatusTransactionEnum.AUTOMATICALLY_RECONCILED:
      return i18n.tUi('enum.statusTransactionEnum.reconciledAutomatically');

    case StatusTransactionEnum.MANUALLY_RECONCILED:
      return i18n.tUi('enum.statusTransactionEnum.manuallyReconciled');

    case StatusTransactionEnum.CANCELED:
      return i18n.tUi('enum.statusTransactionEnum.canceledSale');

    case StatusTransactionEnum.DELETED:
      return i18n.tUi('enum.statusTransactionEnum.excludedSale');

    case StatusTransactionEnum.PENDING:
    case StatusTransactionEnum.NULL:
    default:
      return i18n.tUi('enum.statusTransactionEnum.pending');
  }
}

export function installmentStatusTooltipTone(statusTransaction: StatusTransactionInput): CsTagTone {
  switch (normalizeStatusTransactionEnum(statusTransaction)) {
    case StatusTransactionEnum.AUTOMATICALLY_RECONCILED:
    case StatusTransactionEnum.MANUALLY_RECONCILED:
      return 'success';

    case StatusTransactionEnum.DELETED:
    case StatusTransactionEnum.CANCELED:
      return 'warn';

    case StatusTransactionEnum.PENDING:
    case StatusTransactionEnum.NULL:
    default:
      return 'danger';
  }
}

export function allStatusTransactionEnum(): StatusTransactionEnum[] {
  return [
    StatusTransactionEnum.AUTOMATICALLY_RECONCILED,
    StatusTransactionEnum.MANUALLY_RECONCILED,
    StatusTransactionEnum.PENDING,
    StatusTransactionEnum.DELETED,
    StatusTransactionEnum.CANCELED,
  ];
}
