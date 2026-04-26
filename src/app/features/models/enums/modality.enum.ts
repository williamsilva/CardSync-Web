import { I18nService } from '@core/i18n/i18n.service';

export enum ModalityEnum {
  NULL = 'NULL',
  CASH_DEBIT = 'CASH_DEBIT',
  CASH_CREDIT = 'CASH_CREDIT',
  INSTALLMENT_CREDIT_2_6 = 'INSTALLMENT_CREDIT_2_6',
  INSTALLMENT_CREDIT_7_12 = 'INSTALLMENT_CREDIT_7_12',
  INSTALLMENT_CREDIT_13_18 = 'INSTALLMENT_CREDIT_13_18',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
  OUTROS = 'OUTROS',
}

export type ModalityInput = ModalityEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, ModalityEnum> = {
  0: ModalityEnum.NULL,
  1: ModalityEnum.CASH_DEBIT,
  2: ModalityEnum.CASH_CREDIT,
  3: ModalityEnum.INSTALLMENT_CREDIT_2_6,
  4: ModalityEnum.INSTALLMENT_CREDIT_7_12,
  5: ModalityEnum.INSTALLMENT_CREDIT_13_18,
  8: ModalityEnum.DIGITAL_WALLET,
  9: ModalityEnum.OUTROS,
};

export function normalizeModalityEnum(modality: ModalityInput): ModalityEnum | null {
  if (modality == null) return null;

  if (typeof modality === 'number') {
    return STATUS_CODE_MAP[modality] ?? null;
  }

  const normalized = String(modality).trim().toUpperCase();

  switch (normalized) {
    case ModalityEnum.NULL:
      return ModalityEnum.NULL;

    case ModalityEnum.CASH_DEBIT:
      return ModalityEnum.CASH_DEBIT;

    case ModalityEnum.CASH_CREDIT:
      return ModalityEnum.CASH_CREDIT;

    case ModalityEnum.INSTALLMENT_CREDIT_2_6:
      return ModalityEnum.INSTALLMENT_CREDIT_2_6;

    case ModalityEnum.INSTALLMENT_CREDIT_7_12:
      return ModalityEnum.INSTALLMENT_CREDIT_7_12;

    case ModalityEnum.INSTALLMENT_CREDIT_13_18:
      return ModalityEnum.INSTALLMENT_CREDIT_13_18;

    case ModalityEnum.DIGITAL_WALLET:
      return ModalityEnum.DIGITAL_WALLET;

    case ModalityEnum.OUTROS:
      return ModalityEnum.OUTROS;

    default:
      return null;
  }
}

export function modalityEnumSeverity(
  modality: ModalityInput,
): 'success' | 'danger' | 'warn' | 'contrast' | 'info' {
  switch (normalizeModalityEnum(modality)) {
    case ModalityEnum.CASH_CREDIT:
    case ModalityEnum.INSTALLMENT_CREDIT_2_6:
    case ModalityEnum.INSTALLMENT_CREDIT_7_12:
    case ModalityEnum.INSTALLMENT_CREDIT_13_18:
      return 'success';

    case ModalityEnum.CASH_DEBIT:
      return 'warn';

    case ModalityEnum.DIGITAL_WALLET:
      return 'danger';

    case ModalityEnum.OUTROS:
    default:
      return 'contrast';
  }
}

export function modalityEnumLabel(modality: ModalityInput, i18n: I18nService): string {
  switch (normalizeModalityEnum(modality)) {
    case ModalityEnum.CASH_DEBIT:
      return i18n.tUi('enum.modalityEnum.cash_debit');

    case ModalityEnum.CASH_CREDIT:
      return i18n.tUi('enum.modalityEnum.cash_credit');

    case ModalityEnum.INSTALLMENT_CREDIT_2_6:
      return i18n.tUi('enum.modalityEnum.installment_2_6');

    case ModalityEnum.INSTALLMENT_CREDIT_7_12:
      return i18n.tUi('enum.modalityEnum.installment_7_12');

    case ModalityEnum.INSTALLMENT_CREDIT_13_18:
      return i18n.tUi('enum.modalityEnum.installment_13_18');

    case ModalityEnum.DIGITAL_WALLET:
      return i18n.tUi('enum.modalityEnum.digital_wallet');

    case ModalityEnum.OUTROS:
      return i18n.tUi('enum.modalityEnum.outros');

    case ModalityEnum.NULL:
      return i18n.tUi('enum.modalityEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.modalityEnum.unknown', 'Desconhecido');
  }
}

export function allModalityEnum(): ModalityEnum[] {
  return [
    ModalityEnum.CASH_DEBIT,
    ModalityEnum.CASH_CREDIT,
    ModalityEnum.INSTALLMENT_CREDIT_2_6,
    ModalityEnum.INSTALLMENT_CREDIT_7_12,
    ModalityEnum.INSTALLMENT_CREDIT_13_18,
  ];
}
