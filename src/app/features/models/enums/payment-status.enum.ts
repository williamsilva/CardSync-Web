import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum PaymentStatusEnum {
  NULL = 'NULL',
  PAID = 'PAID',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
  CANCELED = 'CANCELED',
  NOT_PAID = 'NOT_PAID',
  DIVERGENT = 'DIVERGENT',
}

export type PaymentStatusInput = PaymentStatusEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, PaymentStatusEnum> = {
  0: PaymentStatusEnum.NULL,
  1: PaymentStatusEnum.PENDING,
  2: PaymentStatusEnum.PAID,
  3: PaymentStatusEnum.NOT_PAID,
  4: PaymentStatusEnum.DIVERGENT,
  5: PaymentStatusEnum.CANCELED,
  6: PaymentStatusEnum.DELETED,
};

export function normalizePaymentStatusEnum(
  paymentStatus: PaymentStatusInput,
): PaymentStatusEnum | null {
  if (paymentStatus == null) return null;

  if (typeof paymentStatus === 'number') {
    return STATUS_CODE_MAP[paymentStatus] ?? null;
  }

  const normalized = String(paymentStatus).trim().toUpperCase();

  switch (normalized) {
    case PaymentStatusEnum.NULL:
      return PaymentStatusEnum.NULL;

    case PaymentStatusEnum.PENDING:
      return PaymentStatusEnum.PENDING;

    case PaymentStatusEnum.NOT_PAID:
      return PaymentStatusEnum.NOT_PAID;

    case PaymentStatusEnum.PAID:
      return PaymentStatusEnum.PAID;

    case PaymentStatusEnum.DIVERGENT:
      return PaymentStatusEnum.DIVERGENT;

    case PaymentStatusEnum.DELETED:
      return PaymentStatusEnum.DELETED;

    case PaymentStatusEnum.CANCELED:
      return PaymentStatusEnum.CANCELED;

    default:
      return null;
  }
}

export function paymentStatusEnumSeverity(paymentStatus: PaymentStatusInput): CsTagTone {
  switch (normalizePaymentStatusEnum(paymentStatus)) {
    case PaymentStatusEnum.PENDING:
      return 'success';

    case PaymentStatusEnum.PAID:
      return 'warn';

    case PaymentStatusEnum.CANCELED:
      return 'orange';

    case PaymentStatusEnum.NOT_PAID:
      return 'info';

    case PaymentStatusEnum.DELETED:
      return 'danger';

    case PaymentStatusEnum.DIVERGENT:
      return 'contrast';

    default:
      return 'contrast';
  }
}

export function paymentStatusEnumLabel(
  paymentStatus: PaymentStatusInput,
  i18n: I18nService,
): string {
  switch (normalizePaymentStatusEnum(paymentStatus)) {
    case PaymentStatusEnum.PENDING:
      return i18n.tUi('enum.paymentStatusEnum.pending');

    case PaymentStatusEnum.PAID:
      return i18n.tUi('enum.paymentStatusEnum.paid');

    case PaymentStatusEnum.CANCELED:
      return i18n.tUi('enum.paymentStatusEnum.canceled');

    case PaymentStatusEnum.NOT_PAID:
      return i18n.tUi('enum.paymentStatusEnum.notPaid');

    case PaymentStatusEnum.DELETED:
      return i18n.tUi('enum.paymentStatusEnum.deleted');

    case PaymentStatusEnum.DIVERGENT:
      return i18n.tUi('enum.paymentStatusEnum.divergent');

    case PaymentStatusEnum.NULL:
      return i18n.tUi('enum.paymentStatusEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.paymentStatusEnum.unknown');
  }
}

export function tooltipStatusLabel(paymentStatus: PaymentStatusInput, i18n: I18nService): string {
  switch (normalizePaymentStatusEnum(paymentStatus)) {
    case PaymentStatusEnum.PAID:
      return i18n.tUi('enum.paymentStatusEnum.paid');

    case PaymentStatusEnum.NOT_PAID:
      return i18n.tUi('enum.paymentStatusEnum.notPaid');

    case PaymentStatusEnum.CANCELED:
      return i18n.tUi('enum.paymentStatusEnum.canceled');

    case PaymentStatusEnum.DELETED:
      return i18n.tUi('enum.paymentStatusEnum.deleted');

    case PaymentStatusEnum.PENDING:
    case PaymentStatusEnum.DIVERGENT:
    case PaymentStatusEnum.NULL:
    default:
      return i18n.tUi('enum.paymentStatusEnum.notReconciled');
  }
}

export function statusTooltipTone(paymentStatus: PaymentStatusInput): CsTagTone {
  switch (normalizePaymentStatusEnum(paymentStatus)) {
    case PaymentStatusEnum.PAID:
    case PaymentStatusEnum.NOT_PAID:
      return 'success';

    case PaymentStatusEnum.DELETED:
    case PaymentStatusEnum.CANCELED:
      return 'warn';

    case PaymentStatusEnum.PENDING:
    case PaymentStatusEnum.DIVERGENT:
    case PaymentStatusEnum.NULL:
    default:
      return 'danger';
  }
}

export function allPaymentStatusEnum(): PaymentStatusEnum[] {
  return [
    PaymentStatusEnum.PAID,
    PaymentStatusEnum.NOT_PAID,
    PaymentStatusEnum.PENDING,
    PaymentStatusEnum.DELETED,
    PaymentStatusEnum.DIVERGENT,
    PaymentStatusEnum.CANCELED,
  ];
}
