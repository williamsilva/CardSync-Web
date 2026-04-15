import { I18nService } from '@core/i18n/i18n.service';

export enum ModalityEnum {
  CASH_DEBIT = 'CASH_DEBIT',
  CASH_CREDIT = 'CASH_CREDIT',
  INSTALLMENT_CREDIT_2_6 = 'INSTALLMENT_CREDIT_2_6',
  INSTALLMENT_CREDIT_7_12 = 'INSTALLMENT_CREDIT_7_12',
}

export function allModalityEnum(): ModalityEnum[] {
  return Object.values(ModalityEnum);
}

export function normalizeModalityEnum(
  value: ModalityEnum | string | null | undefined,
): ModalityEnum | null {
  if (!value) return null;

  const normalized = String(value).trim().toUpperCase();
  return allModalityEnum().find((item) => item === normalized) ?? null;
}

export function modalityEnumLabel(
  value: ModalityEnum | string | null | undefined,
  i18n: I18nService,
): string {
  const normalized = normalizeModalityEnum(value);
  if (!normalized) return i18n.tUi('common.notInformed');

  return i18n.tUi(`modality.${normalized}` as never, normalized);
}
