import { I18nService } from '@core/i18n/i18n.service';

import { CsTagTone } from '@shared/ui';

export enum StatusTransactionReasonEnum {
  NULL = 'NULL',
  CV_NOT_FOUND_ERP = 'CV_NOT_FOUND_ERP',
  CANCELED = 'CANCELED',
  DIFFERENT_PLANS = 'DIFFERENT_PLANS',
  CV_NOT_FOUND_ADQ = 'CV_NOT_FOUND_ADQ',
  CHARGEBACK = 'CHARGEBACK',
  SCHEDULED = 'SCHEDULED',
  FLAG_MISMATCH = 'FLAG_MISMATCH',
  VALUE_MISMATCH = 'VALUE_MISMATCH',
  ACQUIRER_MISMATCH = 'ACQUIRER_MISMATCH',
  AMBIGUOUS_MATCH = 'AMBIGUOUS_MATCH',
}

export type StatusTransactionReasonInput =
  | StatusTransactionReasonEnum
  | string
  | number
  | null
  | undefined;

export const STATUS_CODE_MAP: Record<number, StatusTransactionReasonEnum> = {
  0: StatusTransactionReasonEnum.NULL,
  1: StatusTransactionReasonEnum.CV_NOT_FOUND_ERP,
  2: StatusTransactionReasonEnum.CV_NOT_FOUND_ADQ,
  3: StatusTransactionReasonEnum.FLAG_MISMATCH,
  4: StatusTransactionReasonEnum.DIFFERENT_PLANS,
  5: StatusTransactionReasonEnum.SCHEDULED,
  6: StatusTransactionReasonEnum.CHARGEBACK,
  7: StatusTransactionReasonEnum.CANCELED,
  8: StatusTransactionReasonEnum.VALUE_MISMATCH,
  9: StatusTransactionReasonEnum.ACQUIRER_MISMATCH,
  10: StatusTransactionReasonEnum.AMBIGUOUS_MATCH,
};

export function normalizeStatusTransactionReasonEnum(
  statusTransactionReason: StatusTransactionReasonInput,
): StatusTransactionReasonEnum | null {
  if (statusTransactionReason == null) return null;

  if (typeof statusTransactionReason === 'number') {
    return STATUS_CODE_MAP[statusTransactionReason] ?? null;
  }

  const normalized = String(statusTransactionReason).trim().toUpperCase();

  switch (normalized) {
    case StatusTransactionReasonEnum.NULL:
      return StatusTransactionReasonEnum.NULL;

    case StatusTransactionReasonEnum.CV_NOT_FOUND_ERP:
      return StatusTransactionReasonEnum.CV_NOT_FOUND_ERP;

    case StatusTransactionReasonEnum.CV_NOT_FOUND_ADQ:
      return StatusTransactionReasonEnum.CV_NOT_FOUND_ADQ;

    case StatusTransactionReasonEnum.FLAG_MISMATCH:
      return StatusTransactionReasonEnum.FLAG_MISMATCH;

    case StatusTransactionReasonEnum.DIFFERENT_PLANS:
      return StatusTransactionReasonEnum.DIFFERENT_PLANS;

    case StatusTransactionReasonEnum.SCHEDULED:
      return StatusTransactionReasonEnum.SCHEDULED;

    case StatusTransactionReasonEnum.CHARGEBACK:
      return StatusTransactionReasonEnum.CHARGEBACK;

    case StatusTransactionReasonEnum.CANCELED:
      return StatusTransactionReasonEnum.CANCELED;

    case StatusTransactionReasonEnum.VALUE_MISMATCH:
      return StatusTransactionReasonEnum.VALUE_MISMATCH;

    case StatusTransactionReasonEnum.ACQUIRER_MISMATCH:
      return StatusTransactionReasonEnum.ACQUIRER_MISMATCH;

    case StatusTransactionReasonEnum.AMBIGUOUS_MATCH:
      return StatusTransactionReasonEnum.AMBIGUOUS_MATCH;

    default:
      return null;
  }
}

export function statusTransactionReasonEnumSeverity(
  statusTransactionReason: StatusTransactionReasonInput,
): CsTagTone {
  switch (normalizeStatusTransactionReasonEnum(statusTransactionReason)) {
    case StatusTransactionReasonEnum.CV_NOT_FOUND_ERP:
      return 'success';

    case StatusTransactionReasonEnum.CV_NOT_FOUND_ADQ:
      return 'warn';

    case StatusTransactionReasonEnum.CANCELED:
      return 'orange';

    case StatusTransactionReasonEnum.FLAG_MISMATCH:
      return 'info';

    case StatusTransactionReasonEnum.CHARGEBACK:
      return 'blue';

    case StatusTransactionReasonEnum.SCHEDULED:
      return 'contrast';

    case StatusTransactionReasonEnum.DIFFERENT_PLANS:
      return 'danger';

    case StatusTransactionReasonEnum.VALUE_MISMATCH:
      return 'pink';

    case StatusTransactionReasonEnum.ACQUIRER_MISMATCH:
      return 'teal';

    case StatusTransactionReasonEnum.AMBIGUOUS_MATCH:
      return 'slate';

    default:
      return 'contrast';
  }
}

export function statusTransactionReasonEnumLabel(
  statusTransactionReason: StatusTransactionReasonInput,
  i18n: I18nService,
): string {
  switch (normalizeStatusTransactionReasonEnum(statusTransactionReason)) {
    case StatusTransactionReasonEnum.CV_NOT_FOUND_ERP:
      return i18n.tUi('enum.transactionReasonEnum.cvNotFoundErp');

    case StatusTransactionReasonEnum.CV_NOT_FOUND_ADQ:
      return i18n.tUi('enum.transactionReasonEnum.cvNotFoundAdq');

    case StatusTransactionReasonEnum.CANCELED:
      return i18n.tUi('enum.transactionReasonEnum.canceled');

    case StatusTransactionReasonEnum.FLAG_MISMATCH:
      return i18n.tUi('enum.transactionReasonEnum.flagMismatch');

    case StatusTransactionReasonEnum.CHARGEBACK:
      return i18n.tUi('enum.transactionReasonEnum.chargeBack');

    case StatusTransactionReasonEnum.DIFFERENT_PLANS:
      return i18n.tUi('enum.transactionReasonEnum.differentPlans');

    case StatusTransactionReasonEnum.SCHEDULED:
      return i18n.tUi('enum.transactionReasonEnum.scheduled');

    case StatusTransactionReasonEnum.VALUE_MISMATCH:
      return i18n.tUi('enum.transactionReasonEnum.valueMismatch');

    case StatusTransactionReasonEnum.ACQUIRER_MISMATCH:
      return i18n.tUi('enum.transactionReasonEnum.acquirerMismatch');

    case StatusTransactionReasonEnum.AMBIGUOUS_MATCH:
      return i18n.tUi('enum.transactionReasonEnum.ambiguousMatch');

    case StatusTransactionReasonEnum.NULL:
      return i18n.tUi('enum.transactionReasonEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.transactionReasonEnum.unknown');
  }
}

export function allStatusTransactionReasonEnum(): StatusTransactionReasonEnum[] {
  return [
    StatusTransactionReasonEnum.CHARGEBACK,
    StatusTransactionReasonEnum.CV_NOT_FOUND_ERP,
    StatusTransactionReasonEnum.CV_NOT_FOUND_ADQ,
    StatusTransactionReasonEnum.FLAG_MISMATCH,
    StatusTransactionReasonEnum.DIFFERENT_PLANS,
    StatusTransactionReasonEnum.SCHEDULED,
    StatusTransactionReasonEnum.CANCELED,
    StatusTransactionReasonEnum.VALUE_MISMATCH,
    StatusTransactionReasonEnum.ACQUIRER_MISMATCH,
    StatusTransactionReasonEnum.AMBIGUOUS_MATCH,
  ];
}
