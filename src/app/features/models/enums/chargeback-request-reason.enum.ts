import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum ChargebackRequestReasonEnum {
  FRAUD = 'FRAUD',
  DOCUMENTATION_REQUEST = 'DOCUMENTATION_REQUEST',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  PRODUCT_NOT_RECEIVED = 'PRODUCT_NOT_RECEIVED',
  CREDIT_NOT_PROCESSED = 'CREDIT_NOT_PROCESSED',
  DEFECTIVE_PRODUCT = 'DEFECTIVE_PRODUCT',
  SERVICE_NOT_PROVIDED = 'SERVICE_NOT_PROVIDED',
  TRANSACTION_CANCELLATION = 'TRANSACTION_CANCELLATION',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
  OTHER = 'OTHER',
}

export type ChargebackRequestReasonInput =
  | ChargebackRequestReasonEnum
  | string
  | number
  | null
  | undefined;

export const STATUS_CODE_MAP: Record<number, ChargebackRequestReasonEnum> = {
  1: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  2: ChargebackRequestReasonEnum.DUPLICATE_TRANSACTION,
  3: ChargebackRequestReasonEnum.FRAUD,
  4: ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED,
  5: ChargebackRequestReasonEnum.CREDIT_NOT_PROCESSED,
  6: ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT,
  7: ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION,
  8: ChargebackRequestReasonEnum.DUPLICATE_REQUEST,
  9: ChargebackRequestReasonEnum.OTHER,

  17: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  21: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  41: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  42: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  50: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  97: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  3001: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  5001: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  3002: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
  5060: ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,

  3055: ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED,
  5030: ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED,
  6355: ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED,

  3053: ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT,
  5053: ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT,
  8202: ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT,
  8502: ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT,

  3059: ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED,
  5130: ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED,

  3060: ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION,
  5085: ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION,

  5082: ChargebackRequestReasonEnum.DUPLICATE_REQUEST,
  3034: ChargebackRequestReasonEnum.DUPLICATE_REQUEST,
};

export function normalizeChargebackRequestReasonEnum(
  value: ChargebackRequestReasonInput,
): ChargebackRequestReasonEnum | null {
  if (value == null) return null;

  if (typeof value === 'number') {
    return STATUS_CODE_MAP[value] ?? null;
  }

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST:
      return ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST;

    case ChargebackRequestReasonEnum.DUPLICATE_TRANSACTION:
      return ChargebackRequestReasonEnum.DUPLICATE_TRANSACTION;

    case ChargebackRequestReasonEnum.FRAUD:
      return ChargebackRequestReasonEnum.FRAUD;

    case ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED:
      return ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED;

    case ChargebackRequestReasonEnum.CREDIT_NOT_PROCESSED:
      return ChargebackRequestReasonEnum.CREDIT_NOT_PROCESSED;

    case ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT:
      return ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT;

    case ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED:
      return ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED;

    case ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION:
      return ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION;

    case ChargebackRequestReasonEnum.DUPLICATE_REQUEST:
      return ChargebackRequestReasonEnum.DUPLICATE_REQUEST;

    case ChargebackRequestReasonEnum.OTHER:
      return ChargebackRequestReasonEnum.OTHER;

    default:
      return null;
  }
}

export function chargebackRequestReasonEnumSeverity(
  value: ChargebackRequestReasonInput,
): CsTagTone {
  switch (normalizeChargebackRequestReasonEnum(value)) {
    case ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST:
      return 'info';

    case ChargebackRequestReasonEnum.DUPLICATE_TRANSACTION:
      return 'warn';

    case ChargebackRequestReasonEnum.FRAUD:
      return 'danger';

    case ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED:
      return 'orange';

    case ChargebackRequestReasonEnum.CREDIT_NOT_PROCESSED:
      return 'blue';

    case ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT:
      return 'error';

    case ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED:
      return 'orange';

    case ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION:
      return 'money';

    case ChargebackRequestReasonEnum.DUPLICATE_REQUEST:
      return 'rede';

    case ChargebackRequestReasonEnum.OTHER:
    default:
      return 'contrast';
  }
}

export function chargebackRequestReasonEnumLabel(
  value: ChargebackRequestReasonInput,
  i18n: I18nService,
): string {
  switch (normalizeChargebackRequestReasonEnum(value)) {
    case ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST:
      return i18n.tUi('enum.chargebackRequestReasonEnum.documentationRequest');

    case ChargebackRequestReasonEnum.DUPLICATE_TRANSACTION:
      return i18n.tUi('enum.chargebackRequestReasonEnum.duplicateTransaction');

    case ChargebackRequestReasonEnum.FRAUD:
      return i18n.tUi('enum.chargebackRequestReasonEnum.fraud');

    case ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED:
      return i18n.tUi('enum.chargebackRequestReasonEnum.productNotReceived');

    case ChargebackRequestReasonEnum.CREDIT_NOT_PROCESSED:
      return i18n.tUi('enum.chargebackRequestReasonEnum.creditNotProcessed');

    case ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT:
      return i18n.tUi('enum.chargebackRequestReasonEnum.defectiveProduct');

    case ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED:
      return i18n.tUi('enum.chargebackRequestReasonEnum.serviceNotProvided');

    case ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION:
      return i18n.tUi('enum.chargebackRequestReasonEnum.transactionCancellation');

    case ChargebackRequestReasonEnum.DUPLICATE_REQUEST:
      return i18n.tUi('enum.chargebackRequestReasonEnum.duplicateRequest');

    case ChargebackRequestReasonEnum.OTHER:
      return i18n.tUi('enum.chargebackRequestReasonEnum.other');

    default:
      return i18n.tUi('enum.chargebackRequestReasonEnum.unknown');
  }
}

export function allChargebackRequestReasonEnum(): ChargebackRequestReasonEnum[] {
  return [
    ChargebackRequestReasonEnum.DOCUMENTATION_REQUEST,
    ChargebackRequestReasonEnum.DUPLICATE_TRANSACTION,
    ChargebackRequestReasonEnum.FRAUD,
    ChargebackRequestReasonEnum.PRODUCT_NOT_RECEIVED,
    ChargebackRequestReasonEnum.CREDIT_NOT_PROCESSED,
    ChargebackRequestReasonEnum.DEFECTIVE_PRODUCT,
    ChargebackRequestReasonEnum.SERVICE_NOT_PROVIDED,
    ChargebackRequestReasonEnum.TRANSACTION_CANCELLATION,
    ChargebackRequestReasonEnum.DUPLICATE_REQUEST,
    ChargebackRequestReasonEnum.OTHER,
  ];
}
