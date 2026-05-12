import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum TransactionStatusEnum {
  NULL = 'NULL',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
  CANCELED = 'CANCELED',
  NOT_RECONCILED = 'NOT_RECONCILED',
  MANUALLY_RECONCILED = 'MANUALLY_RECONCILED',
  AUTOMATICALLY_RECONCILED = 'AUTOMATICALLY_RECONCILED',
}

export type TransactionStatusInput = TransactionStatusEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, TransactionStatusEnum> = {
  0: TransactionStatusEnum.NULL,
  1: TransactionStatusEnum.PENDING,
  2: TransactionStatusEnum.AUTOMATICALLY_RECONCILED,
  3: TransactionStatusEnum.MANUALLY_RECONCILED,
  4: TransactionStatusEnum.NOT_RECONCILED,
  5: TransactionStatusEnum.CANCELED,
  6: TransactionStatusEnum.DELETED,
};

export function normalizeTransactionStatusEnum(
  transactionStatus: TransactionStatusInput,
): TransactionStatusEnum | null {
  if (transactionStatus == null) return null;

  if (typeof transactionStatus === 'number') {
    return STATUS_CODE_MAP[transactionStatus] ?? null;
  }

  const normalized = String(transactionStatus).trim().toUpperCase();

  switch (normalized) {
    case TransactionStatusEnum.NULL:
      return TransactionStatusEnum.NULL;

    case TransactionStatusEnum.PENDING:
      return TransactionStatusEnum.PENDING;

    case TransactionStatusEnum.MANUALLY_RECONCILED:
      return TransactionStatusEnum.MANUALLY_RECONCILED;

    case TransactionStatusEnum.AUTOMATICALLY_RECONCILED:
      return TransactionStatusEnum.AUTOMATICALLY_RECONCILED;

    case TransactionStatusEnum.NOT_RECONCILED:
      return TransactionStatusEnum.NOT_RECONCILED;

    case TransactionStatusEnum.DELETED:
      return TransactionStatusEnum.DELETED;

    case TransactionStatusEnum.CANCELED:
      return TransactionStatusEnum.CANCELED;

    default:
      return null;
  }
}

export function transactionStatusEnumSeverity(
  transactionStatus: TransactionStatusInput,
): CsTagTone {
  switch (normalizeTransactionStatusEnum(transactionStatus)) {
    case TransactionStatusEnum.PENDING:
      return 'success';

    case TransactionStatusEnum.AUTOMATICALLY_RECONCILED:
      return 'warn';

    case TransactionStatusEnum.CANCELED:
      return 'orange';

    case TransactionStatusEnum.MANUALLY_RECONCILED:
      return 'info';

    case TransactionStatusEnum.DELETED:
      return 'danger';

    case TransactionStatusEnum.NOT_RECONCILED:
      return 'contrast';

    default:
      return 'contrast';
  }
}

export function transactionStatusEnumLabel(
  transactionStatus: TransactionStatusInput,
  i18n: I18nService,
): string {
  switch (normalizeTransactionStatusEnum(transactionStatus)) {
    case TransactionStatusEnum.PENDING:
      return i18n.tUi('enum.transactionStatusEnum.pending');

    case TransactionStatusEnum.AUTOMATICALLY_RECONCILED:
      return i18n.tUi('enum.transactionStatusEnum.reconciledAutomatically');

    case TransactionStatusEnum.CANCELED:
      return i18n.tUi('enum.transactionStatusEnum.canceled');

    case TransactionStatusEnum.MANUALLY_RECONCILED:
      return i18n.tUi('enum.transactionStatusEnum.manuallyReconciled');

    case TransactionStatusEnum.DELETED:
      return i18n.tUi('enum.transactionStatusEnum.deleted');

    case TransactionStatusEnum.NOT_RECONCILED:
      return i18n.tUi('enum.transactionStatusEnum.notReconciled');

    case TransactionStatusEnum.NULL:
      return i18n.tUi('enum.transactionStatusEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.transactionStatusEnum.unknown');
  }
}

export function installmentTooltipStatusLabel(
  transactionStatus: TransactionStatusInput,
  i18n: I18nService,
): string {
  switch (normalizeTransactionStatusEnum(transactionStatus)) {
    case TransactionStatusEnum.AUTOMATICALLY_RECONCILED:
      return i18n.tUi('enum.transactionStatusEnum.reconciledAutomatically');

    case TransactionStatusEnum.MANUALLY_RECONCILED:
      return i18n.tUi('enum.transactionStatusEnum.manuallyReconciled');

    case TransactionStatusEnum.CANCELED:
      return i18n.tUi('enum.transactionStatusEnum.canceledSale');

    case TransactionStatusEnum.DELETED:
      return i18n.tUi('enum.transactionStatusEnum.excludedSale');

    case TransactionStatusEnum.PENDING:
    case TransactionStatusEnum.NOT_RECONCILED:
    case TransactionStatusEnum.NULL:
    default:
      return i18n.tUi('enum.transactionStatusEnum.notReconciled');
  }
}

export function installmentStatusTooltipTone(transactionStatus: TransactionStatusInput): CsTagTone {
  switch (normalizeTransactionStatusEnum(transactionStatus)) {
    case TransactionStatusEnum.AUTOMATICALLY_RECONCILED:
    case TransactionStatusEnum.MANUALLY_RECONCILED:
      return 'success';

    case TransactionStatusEnum.DELETED:
    case TransactionStatusEnum.CANCELED:
      return 'warn';

    case TransactionStatusEnum.PENDING:
    case TransactionStatusEnum.NOT_RECONCILED:
    case TransactionStatusEnum.NULL:
    default:
      return 'danger';
  }
}

export function allTransactionStatusEnum(): TransactionStatusEnum[] {
  return [
    TransactionStatusEnum.DELETED,
    TransactionStatusEnum.PENDING,
    TransactionStatusEnum.AUTOMATICALLY_RECONCILED,
    TransactionStatusEnum.MANUALLY_RECONCILED,
    TransactionStatusEnum.NOT_RECONCILED,
    TransactionStatusEnum.CANCELED,
  ];
}
