import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum ReleaseCategoryEnum {
  NULL = 'NULL',
  PIX = 'PIX',
  TF_PIX = 'TF_PIX',
  APL_AUT = 'APL_AUT',
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT',
}

export type ReleaseCategoryInput = ReleaseCategoryEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, ReleaseCategoryEnum> = {
  0: ReleaseCategoryEnum.NULL,
  1: ReleaseCategoryEnum.PIX,
  2: ReleaseCategoryEnum.PAYMENT,
  3: ReleaseCategoryEnum.RECEIPT,
  4: ReleaseCategoryEnum.TF_PIX,
  5: ReleaseCategoryEnum.APL_AUT,
};

export function normalizeReleaseCategoryEnum(
  statusTransaction: ReleaseCategoryInput,
): ReleaseCategoryEnum | null {
  if (statusTransaction == null) return null;

  if (typeof statusTransaction === 'number') {
    return STATUS_CODE_MAP[statusTransaction] ?? null;
  }

  const normalized = String(statusTransaction).trim().toUpperCase();

  switch (normalized) {
    case ReleaseCategoryEnum.NULL:
      return ReleaseCategoryEnum.NULL;

    case ReleaseCategoryEnum.PIX:
      return ReleaseCategoryEnum.PIX;

    case ReleaseCategoryEnum.RECEIPT:
      return ReleaseCategoryEnum.RECEIPT;

    case ReleaseCategoryEnum.PAYMENT:
      return ReleaseCategoryEnum.PAYMENT;

    case ReleaseCategoryEnum.TF_PIX:
      return ReleaseCategoryEnum.TF_PIX;

    case ReleaseCategoryEnum.APL_AUT:
      return ReleaseCategoryEnum.APL_AUT;

    default:
      return null;
  }
}

export function releaseCategorySeverity(statusTransaction: ReleaseCategoryInput): CsTagTone {
  switch (normalizeReleaseCategoryEnum(statusTransaction)) {
    case ReleaseCategoryEnum.PIX:
      return 'warn';

    case ReleaseCategoryEnum.PAYMENT:
      return 'success';

    case ReleaseCategoryEnum.APL_AUT:
      return 'orange';

    case ReleaseCategoryEnum.RECEIPT:
      return 'info';

    case ReleaseCategoryEnum.TF_PIX:
      return 'danger';

    default:
      return 'contrast';
  }
}

export function releaseCategoryLabel(
  statusTransaction: ReleaseCategoryInput,
  i18n: I18nService,
): string {
  switch (normalizeReleaseCategoryEnum(statusTransaction)) {
    case ReleaseCategoryEnum.PIX:
      return i18n.tUi('enum.releaseCategory.pix');

    case ReleaseCategoryEnum.PAYMENT:
      return i18n.tUi('enum.releaseCategory.payment');

    case ReleaseCategoryEnum.APL_AUT:
      return i18n.tUi('enum.releaseCategory.aplAut');

    case ReleaseCategoryEnum.RECEIPT:
      return i18n.tUi('enum.releaseCategory.receipt');

    case ReleaseCategoryEnum.TF_PIX:
      return i18n.tUi('enum.releaseCategory.tfPix');

    case ReleaseCategoryEnum.NULL:
      return i18n.tUi('enum.releaseCategory.null', 'N/A');

    default:
      return i18n.tUi('enum.releaseCategory.unknown');
  }
}

export function allReleaseCategoryEnum(): ReleaseCategoryEnum[] {
  return [
    ReleaseCategoryEnum.PAYMENT,
    ReleaseCategoryEnum.RECEIPT,
    ReleaseCategoryEnum.PIX,
    ReleaseCategoryEnum.TF_PIX,
    ReleaseCategoryEnum.APL_AUT,
  ];
}
