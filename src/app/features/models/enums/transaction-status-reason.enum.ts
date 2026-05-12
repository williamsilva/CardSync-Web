import { I18nService } from '@core/i18n/i18n.service';

import { CsTagTone } from '@shared/ui';

export enum TransactionStatusReasonEnum {
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

export type TransactionStatusReasonInput =
  | TransactionStatusReasonEnum
  | string
  | number
  | null
  | undefined;

export const STATUS_CODE_MAP: Record<number, TransactionStatusReasonEnum> = {
  0: TransactionStatusReasonEnum.NULL,
  1: TransactionStatusReasonEnum.CV_NOT_FOUND_ERP,
  2: TransactionStatusReasonEnum.CV_NOT_FOUND_ADQ,
  3: TransactionStatusReasonEnum.FLAG_MISMATCH,
  4: TransactionStatusReasonEnum.DIFFERENT_PLANS,
  5: TransactionStatusReasonEnum.SCHEDULED,
  6: TransactionStatusReasonEnum.CHARGEBACK,
  7: TransactionStatusReasonEnum.CANCELED,
  8: TransactionStatusReasonEnum.VALUE_MISMATCH,
  9: TransactionStatusReasonEnum.ACQUIRER_MISMATCH,
  10: TransactionStatusReasonEnum.AMBIGUOUS_MATCH,
};

export function normalizeTransactionStatusReasonEnum(
  statusTransactionReason: TransactionStatusReasonInput,
): TransactionStatusReasonEnum | null {
  if (statusTransactionReason == null) return null;

  if (typeof statusTransactionReason === 'number') {
    return STATUS_CODE_MAP[statusTransactionReason] ?? null;
  }

  const normalized = String(statusTransactionReason).trim().toUpperCase();

  switch (normalized) {
    case TransactionStatusReasonEnum.NULL:
      return TransactionStatusReasonEnum.NULL;

    case TransactionStatusReasonEnum.CV_NOT_FOUND_ERP:
      return TransactionStatusReasonEnum.CV_NOT_FOUND_ERP;

    case TransactionStatusReasonEnum.CV_NOT_FOUND_ADQ:
      return TransactionStatusReasonEnum.CV_NOT_FOUND_ADQ;

    case TransactionStatusReasonEnum.FLAG_MISMATCH:
      return TransactionStatusReasonEnum.FLAG_MISMATCH;

    case TransactionStatusReasonEnum.DIFFERENT_PLANS:
      return TransactionStatusReasonEnum.DIFFERENT_PLANS;

    case TransactionStatusReasonEnum.SCHEDULED:
      return TransactionStatusReasonEnum.SCHEDULED;

    case TransactionStatusReasonEnum.CHARGEBACK:
      return TransactionStatusReasonEnum.CHARGEBACK;

    case TransactionStatusReasonEnum.CANCELED:
      return TransactionStatusReasonEnum.CANCELED;

    case TransactionStatusReasonEnum.VALUE_MISMATCH:
      return TransactionStatusReasonEnum.VALUE_MISMATCH;

    case TransactionStatusReasonEnum.ACQUIRER_MISMATCH:
      return TransactionStatusReasonEnum.ACQUIRER_MISMATCH;

    case TransactionStatusReasonEnum.AMBIGUOUS_MATCH:
      return TransactionStatusReasonEnum.AMBIGUOUS_MATCH;

    default:
      return null;
  }
}

export function statusTransactionReasonEnumSeverity(
  statusTransactionReason: TransactionStatusReasonInput,
): CsTagTone {
  switch (normalizeTransactionStatusReasonEnum(statusTransactionReason)) {
    case TransactionStatusReasonEnum.CV_NOT_FOUND_ERP:
      return 'success';

    case TransactionStatusReasonEnum.CV_NOT_FOUND_ADQ:
      return 'warn';

    case TransactionStatusReasonEnum.CANCELED:
      return 'orange';

    case TransactionStatusReasonEnum.FLAG_MISMATCH:
      return 'info';

    case TransactionStatusReasonEnum.CHARGEBACK:
      return 'blue';

    case TransactionStatusReasonEnum.SCHEDULED:
      return 'contrast';

    case TransactionStatusReasonEnum.DIFFERENT_PLANS:
      return 'danger';

    case TransactionStatusReasonEnum.VALUE_MISMATCH:
      return 'pink';

    case TransactionStatusReasonEnum.ACQUIRER_MISMATCH:
      return 'teal';

    case TransactionStatusReasonEnum.AMBIGUOUS_MATCH:
      return 'slate';

    default:
      return 'contrast';
  }
}

export function statusTransactionReasonEnumLabel(
  statusTransactionReason: TransactionStatusReasonInput,
  i18n: I18nService,
): string {
  switch (normalizeTransactionStatusReasonEnum(statusTransactionReason)) {
    case TransactionStatusReasonEnum.CV_NOT_FOUND_ERP:
      return i18n.tUi('enum.transactionReasonEnum.cvNotFoundErp');

    case TransactionStatusReasonEnum.CV_NOT_FOUND_ADQ:
      return i18n.tUi('enum.transactionReasonEnum.cvNotFoundAdq');

    case TransactionStatusReasonEnum.CANCELED:
      return i18n.tUi('enum.transactionReasonEnum.canceled');

    case TransactionStatusReasonEnum.FLAG_MISMATCH:
      return i18n.tUi('enum.transactionReasonEnum.flagMismatch');

    case TransactionStatusReasonEnum.CHARGEBACK:
      return i18n.tUi('enum.transactionReasonEnum.chargeBack');

    case TransactionStatusReasonEnum.DIFFERENT_PLANS:
      return i18n.tUi('enum.transactionReasonEnum.differentPlans');

    case TransactionStatusReasonEnum.SCHEDULED:
      return i18n.tUi('enum.transactionReasonEnum.scheduled');

    case TransactionStatusReasonEnum.VALUE_MISMATCH:
      return i18n.tUi('enum.transactionReasonEnum.valueMismatch');

    case TransactionStatusReasonEnum.ACQUIRER_MISMATCH:
      return i18n.tUi('enum.transactionReasonEnum.acquirerMismatch');

    case TransactionStatusReasonEnum.AMBIGUOUS_MATCH:
      return i18n.tUi('enum.transactionReasonEnum.ambiguousMatch');

    case TransactionStatusReasonEnum.NULL:
      return i18n.tUi('enum.transactionReasonEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.transactionReasonEnum.unknown');
  }
}

export function allTransactionStatusReasonEnum(): TransactionStatusReasonEnum[] {
  return [
    TransactionStatusReasonEnum.CHARGEBACK,
    TransactionStatusReasonEnum.CV_NOT_FOUND_ERP,
    TransactionStatusReasonEnum.CV_NOT_FOUND_ADQ,
    TransactionStatusReasonEnum.FLAG_MISMATCH,
    TransactionStatusReasonEnum.DIFFERENT_PLANS,
    TransactionStatusReasonEnum.SCHEDULED,
    TransactionStatusReasonEnum.CANCELED,
    TransactionStatusReasonEnum.VALUE_MISMATCH,
    TransactionStatusReasonEnum.ACQUIRER_MISMATCH,
    TransactionStatusReasonEnum.AMBIGUOUS_MATCH,
  ];
}
