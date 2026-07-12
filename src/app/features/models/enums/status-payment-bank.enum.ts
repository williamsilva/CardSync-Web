import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum StatusPaymentBankEnum {
  NULL = 'NULL',
  PAID = 'PAID',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
  CANCELED = 'CANCELED',
  NOT_PAID = 'NOT_PAID',
  DIVERGENT = 'DIVERGENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  LEGACY = 'LEGACY',
}

export type StatusPaymentBankInput = StatusPaymentBankEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, StatusPaymentBankEnum> = {
  0: StatusPaymentBankEnum.NULL,
  1: StatusPaymentBankEnum.PENDING,
  2: StatusPaymentBankEnum.PAID,
  3: StatusPaymentBankEnum.NOT_PAID,
  4: StatusPaymentBankEnum.DIVERGENT,
  5: StatusPaymentBankEnum.CANCELED,
  6: StatusPaymentBankEnum.DELETED,
  7: StatusPaymentBankEnum.PARTIALLY_PAID,
  8: StatusPaymentBankEnum.LEGACY,
};

export function normalizeStatusPaymentBankEnum(
  statusPaymentBank: StatusPaymentBankInput,
): StatusPaymentBankEnum | null {
  if (statusPaymentBank == null) return null;

  if (typeof statusPaymentBank === 'number') {
    return STATUS_CODE_MAP[statusPaymentBank] ?? null;
  }

  const normalized = String(statusPaymentBank).trim().toUpperCase();

  switch (normalized) {
    case StatusPaymentBankEnum.NULL:
      return StatusPaymentBankEnum.NULL;

    case StatusPaymentBankEnum.PENDING:
      return StatusPaymentBankEnum.PENDING;

    case StatusPaymentBankEnum.NOT_PAID:
      return StatusPaymentBankEnum.NOT_PAID;

    case StatusPaymentBankEnum.PAID:
      return StatusPaymentBankEnum.PAID;

    case StatusPaymentBankEnum.DIVERGENT:
      return StatusPaymentBankEnum.DIVERGENT;

    case StatusPaymentBankEnum.DELETED:
      return StatusPaymentBankEnum.DELETED;

    case StatusPaymentBankEnum.CANCELED:
      return StatusPaymentBankEnum.CANCELED;

    case StatusPaymentBankEnum.PARTIALLY_PAID:
      return StatusPaymentBankEnum.PARTIALLY_PAID;

    case StatusPaymentBankEnum.LEGACY:
      return StatusPaymentBankEnum.LEGACY;

    default:
      return null;
  }
}

export function statusPaymentBankEnumSeverity(
  statusPaymentBank: StatusPaymentBankInput,
): CsTagTone {
  switch (normalizeStatusPaymentBankEnum(statusPaymentBank)) {
    case StatusPaymentBankEnum.PENDING:
      return 'warn';

    case StatusPaymentBankEnum.PAID:
      return 'success';

    case StatusPaymentBankEnum.CANCELED:
      return 'orange';

    case StatusPaymentBankEnum.NOT_PAID:
      return 'info';

    case StatusPaymentBankEnum.DELETED:
      return 'danger';

    case StatusPaymentBankEnum.DIVERGENT:
      return 'blue';

    case StatusPaymentBankEnum.PARTIALLY_PAID:
      return 'bank';

    case StatusPaymentBankEnum.LEGACY:
      return 'contrast';

    default:
      return 'contrast';
  }
}

export function statusPaymentBankEnumLabel(
  statusPaymentBank: StatusPaymentBankInput,
  i18n: I18nService,
): string {
  switch (normalizeStatusPaymentBankEnum(statusPaymentBank)) {
    case StatusPaymentBankEnum.PENDING:
      return i18n.tUi('enum.statusPaymentBankEnum.pending');

    case StatusPaymentBankEnum.PAID:
      return i18n.tUi('enum.statusPaymentBankEnum.paid');

    case StatusPaymentBankEnum.CANCELED:
      return i18n.tUi('enum.statusPaymentBankEnum.canceled');

    case StatusPaymentBankEnum.NOT_PAID:
      return i18n.tUi('enum.statusPaymentBankEnum.notPaid');

    case StatusPaymentBankEnum.DELETED:
      return i18n.tUi('enum.statusPaymentBankEnum.deleted');

    case StatusPaymentBankEnum.DIVERGENT:
      return i18n.tUi('enum.statusPaymentBankEnum.divergent');

    case StatusPaymentBankEnum.PARTIALLY_PAID:
      return i18n.tUi('enum.statusPaymentBankEnum.partiallyPaid');

    case StatusPaymentBankEnum.LEGACY:
      return i18n.tUi('enum.statusPaymentBankEnum.legacy');

    case StatusPaymentBankEnum.NULL:
      return i18n.tUi('enum.statusPaymentBankEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.statusPaymentBankEnum.unknown');
  }
}

export function tooltipStatusLabel(
  statusPaymentBank: StatusPaymentBankInput,
  i18n: I18nService,
): string {
  switch (normalizeStatusPaymentBankEnum(statusPaymentBank)) {
    case StatusPaymentBankEnum.PAID:
      return i18n.tUi('enum.statusPaymentBankEnum.paid');

    case StatusPaymentBankEnum.NOT_PAID:
      return i18n.tUi('enum.statusPaymentBankEnum.notPaid');

    case StatusPaymentBankEnum.CANCELED:
      return i18n.tUi('enum.statusPaymentBankEnum.canceled');

    case StatusPaymentBankEnum.DELETED:
      return i18n.tUi('enum.statusPaymentBankEnum.deleted');

    case StatusPaymentBankEnum.PENDING:
    case StatusPaymentBankEnum.DIVERGENT:
    case StatusPaymentBankEnum.NULL:
    default:
      return i18n.tUi('enum.statusPaymentBankEnum.notReconciled');
  }
}

export function statusTooltipTone(statusPaymentBank: StatusPaymentBankInput): CsTagTone {
  switch (normalizeStatusPaymentBankEnum(statusPaymentBank)) {
    case StatusPaymentBankEnum.PAID:
    case StatusPaymentBankEnum.NOT_PAID:
      return 'success';

    case StatusPaymentBankEnum.DELETED:
    case StatusPaymentBankEnum.CANCELED:
      return 'warn';

    case StatusPaymentBankEnum.PENDING:
    case StatusPaymentBankEnum.DIVERGENT:
    case StatusPaymentBankEnum.NULL:
    default:
      return 'danger';
  }
}

export function allStatusPaymentBankEnum(): StatusPaymentBankEnum[] {
  return [
    StatusPaymentBankEnum.PAID,
    StatusPaymentBankEnum.NOT_PAID,
    StatusPaymentBankEnum.PARTIALLY_PAID,
    StatusPaymentBankEnum.PENDING,
    StatusPaymentBankEnum.DIVERGENT,
    StatusPaymentBankEnum.DELETED,
    StatusPaymentBankEnum.CANCELED,
    StatusPaymentBankEnum.LEGACY,
  ];
}

export function allStatusPaymentBankStatementEnum(): StatusPaymentBankEnum[] {
  return [
    StatusPaymentBankEnum.PAID,
    StatusPaymentBankEnum.PARTIALLY_PAID,
    StatusPaymentBankEnum.PENDING,
    StatusPaymentBankEnum.DIVERGENT,
    StatusPaymentBankEnum.LEGACY,
  ];
}

export function allStatusPaymentCreditOrderEnum(): StatusPaymentBankEnum[] {
  return [
    StatusPaymentBankEnum.PAID,
    StatusPaymentBankEnum.PENDING,
    StatusPaymentBankEnum.DIVERGENT,
  ];
}

export function allStatusPaymentSaleSummaryEnum(): StatusPaymentBankEnum[] {
  return [
    StatusPaymentBankEnum.PAID,
    StatusPaymentBankEnum.PARTIALLY_PAID,
    StatusPaymentBankEnum.PENDING,
    StatusPaymentBankEnum.DIVERGENT,
  ];
}
