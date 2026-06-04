import { I18nService } from '@core/i18n/i18n.service';

import { CsTagTone } from '@shared/ui';

export enum StatusTransactionReasonEnum {
  NULL = 'NULL',
  CV_NOT_FOUND_ERP = 'CV_NOT_FOUND_ERP',
  CANCEL_VENDAS = 'CANCEL_VENDAS',
  DIFFERENT_PLANS = 'DIFFERENT_PLANS',
  CV_NOT_FOUND_ADQ = 'CV_NOT_FOUND_ADQ',
  CHARGEBACK = 'CHARGEBACK',
  SCHEDULED = 'SCHEDULED',
  FLAG_MISMATCH = 'FLAG_MISMATCH',
  VALUE_MISMATCH = 'VALUE_MISMATCH',
  ACQUIRER_MISMATCH = 'ACQUIRER_MISMATCH',
  AMBIGUOUS_MATCH = 'AMBIGUOUS_MATCH',
  CANCELLATION_ACQUIRER = 'CANCELLATION_ACQUIRER',
  CANCELLATION_RETURN = 'CANCELLATION_RETURN',
  CANCELLATION_REFUND = 'CANCELLATION_REFUND',
  CANCELLATION_DUPLICATE = 'CANCELLATION_DUPLICATE',
  CANCELLATION_FRAUD = 'CANCELLATION_FRAUD',
  CANCELLATION_OPERATIONAL_ERROR = 'CANCELLATION_OPERATIONAL_ERROR',
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
  6: StatusTransactionReasonEnum.CANCEL_VENDAS,
  7: StatusTransactionReasonEnum.CHARGEBACK,
  8: StatusTransactionReasonEnum.VALUE_MISMATCH,
  9: StatusTransactionReasonEnum.ACQUIRER_MISMATCH,
  10: StatusTransactionReasonEnum.AMBIGUOUS_MATCH,
  11: StatusTransactionReasonEnum.CANCELLATION_ACQUIRER,
  12: StatusTransactionReasonEnum.CANCELLATION_REFUND,
  13: StatusTransactionReasonEnum.CANCELLATION_RETURN,
  14: StatusTransactionReasonEnum.CANCELLATION_DUPLICATE,
  15: StatusTransactionReasonEnum.CANCELLATION_FRAUD,
  16: StatusTransactionReasonEnum.CANCELLATION_OPERATIONAL_ERROR,
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

    case StatusTransactionReasonEnum.CANCEL_VENDAS:
      return StatusTransactionReasonEnum.CANCEL_VENDAS;

    case StatusTransactionReasonEnum.VALUE_MISMATCH:
      return StatusTransactionReasonEnum.VALUE_MISMATCH;

    case StatusTransactionReasonEnum.ACQUIRER_MISMATCH:
      return StatusTransactionReasonEnum.ACQUIRER_MISMATCH;

    case StatusTransactionReasonEnum.AMBIGUOUS_MATCH:
      return StatusTransactionReasonEnum.AMBIGUOUS_MATCH;

    case StatusTransactionReasonEnum.CANCELLATION_ACQUIRER:
      return StatusTransactionReasonEnum.CANCELLATION_ACQUIRER;

    case StatusTransactionReasonEnum.CANCELLATION_REFUND:
      return StatusTransactionReasonEnum.CANCELLATION_REFUND;

    case StatusTransactionReasonEnum.CANCELLATION_RETURN:
      return StatusTransactionReasonEnum.CANCELLATION_RETURN;

    case StatusTransactionReasonEnum.CANCELLATION_DUPLICATE:
      return StatusTransactionReasonEnum.CANCELLATION_DUPLICATE;

    case StatusTransactionReasonEnum.CANCELLATION_FRAUD:
      return StatusTransactionReasonEnum.CANCELLATION_FRAUD;

    case StatusTransactionReasonEnum.CANCELLATION_OPERATIONAL_ERROR:
      return StatusTransactionReasonEnum.CANCELLATION_OPERATIONAL_ERROR;

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

    case StatusTransactionReasonEnum.CANCEL_VENDAS:
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

    case StatusTransactionReasonEnum.CANCEL_VENDAS:
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

    case StatusTransactionReasonEnum.CANCELLATION_ACQUIRER:
      return i18n.tUi('enum.transactionReasonEnum.cancellationAcquirer');

    case StatusTransactionReasonEnum.CANCELLATION_REFUND:
      return i18n.tUi('enum.transactionReasonEnum.cancellationRefound');

    case StatusTransactionReasonEnum.CANCELLATION_RETURN:
      return i18n.tUi('enum.transactionReasonEnum.cancellationReturn');

    case StatusTransactionReasonEnum.CANCELLATION_DUPLICATE:
      return i18n.tUi('enum.transactionReasonEnum.cancellationDuplicate');

    case StatusTransactionReasonEnum.CANCELLATION_FRAUD:
      return i18n.tUi('enum.transactionReasonEnum.cancellationFraud');

    case StatusTransactionReasonEnum.CANCELLATION_OPERATIONAL_ERROR:
      return i18n.tUi('enum.transactionReasonEnum.cancellationOperationalError');

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
    StatusTransactionReasonEnum.CANCEL_VENDAS,
    StatusTransactionReasonEnum.VALUE_MISMATCH,
    StatusTransactionReasonEnum.ACQUIRER_MISMATCH,
    StatusTransactionReasonEnum.AMBIGUOUS_MATCH,
    StatusTransactionReasonEnum.CANCELLATION_ACQUIRER,
    StatusTransactionReasonEnum.CANCELLATION_REFUND,
    StatusTransactionReasonEnum.CANCELLATION_RETURN,
    StatusTransactionReasonEnum.CANCELLATION_DUPLICATE,
    StatusTransactionReasonEnum.CANCELLATION_FRAUD,
    StatusTransactionReasonEnum.CANCELLATION_OPERATIONAL_ERROR,
  ];
}
