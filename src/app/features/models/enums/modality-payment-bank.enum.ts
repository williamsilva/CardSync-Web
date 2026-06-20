import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum ModalityPaymentBankEnum {
  NULL = 'NULL',
  IOF = 'IOF',
  PIX_DEV = 'PIX_DEV',
  PIX_ENV = 'PIX_ENV',
  PIX_REC = 'PIX_REC',
  TED_REC = 'TED_REC',
  PGTO_BOL = 'PGTO_BOL',
  APL_CONT = 'APL_CONT',
  PGTO_SALA = 'PGTO_SALA',
  CASH_DEBIT = 'CASH_DEBIT',
  CASH_CREDIT = 'CASH_CREDIT',
  TRF_PIX_ENV = 'TRF_PIX_ENV',
  ANTECIP_CRED = 'ANTECIP_CRED',
  TRF_PIX_CHECK = 'TRF_PIX_CHECK',
}

export type ModalityPaymentBankInput = ModalityPaymentBankEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, ModalityPaymentBankEnum> = {
  0: ModalityPaymentBankEnum.NULL,
  1: ModalityPaymentBankEnum.CASH_DEBIT,
  2: ModalityPaymentBankEnum.CASH_CREDIT,
  3: ModalityPaymentBankEnum.PIX_REC,
  4: ModalityPaymentBankEnum.PIX_DEV,
  5: ModalityPaymentBankEnum.PIX_ENV,
  6: ModalityPaymentBankEnum.TRF_PIX_ENV,
  7: ModalityPaymentBankEnum.TRF_PIX_CHECK,
  8: ModalityPaymentBankEnum.TED_REC,
  9: ModalityPaymentBankEnum.PGTO_BOL,
  10: ModalityPaymentBankEnum.PGTO_SALA,
  11: ModalityPaymentBankEnum.APL_CONT,
  12: ModalityPaymentBankEnum.IOF,
  13: ModalityPaymentBankEnum.ANTECIP_CRED,
};

export function normalizeModalityPaymentBankEnum(
  statusTransaction: ModalityPaymentBankInput,
): ModalityPaymentBankEnum | null {
  if (statusTransaction == null) return null;

  if (typeof statusTransaction === 'number') {
    return STATUS_CODE_MAP[statusTransaction] ?? null;
  }

  const normalized = String(statusTransaction).trim().toUpperCase();

  switch (normalized) {
    case ModalityPaymentBankEnum.NULL:
      return ModalityPaymentBankEnum.NULL;

    case ModalityPaymentBankEnum.CASH_DEBIT:
      return ModalityPaymentBankEnum.CASH_DEBIT;

    case ModalityPaymentBankEnum.PIX_REC:
      return ModalityPaymentBankEnum.PIX_REC;

    case ModalityPaymentBankEnum.CASH_CREDIT:
      return ModalityPaymentBankEnum.CASH_CREDIT;

    case ModalityPaymentBankEnum.PIX_DEV:
      return ModalityPaymentBankEnum.PIX_DEV;

    case ModalityPaymentBankEnum.TRF_PIX_ENV:
      return ModalityPaymentBankEnum.TRF_PIX_ENV;

    case ModalityPaymentBankEnum.TRF_PIX_CHECK:
      return ModalityPaymentBankEnum.TRF_PIX_CHECK;

    case ModalityPaymentBankEnum.TED_REC:
      return ModalityPaymentBankEnum.TED_REC;

    case ModalityPaymentBankEnum.PGTO_BOL:
      return ModalityPaymentBankEnum.PGTO_BOL;

    case ModalityPaymentBankEnum.PGTO_SALA:
      return ModalityPaymentBankEnum.PGTO_SALA;

    case ModalityPaymentBankEnum.APL_CONT:
      return ModalityPaymentBankEnum.APL_CONT;

    case ModalityPaymentBankEnum.IOF:
      return ModalityPaymentBankEnum.IOF;

    case ModalityPaymentBankEnum.ANTECIP_CRED:
      return ModalityPaymentBankEnum.ANTECIP_CRED;

    default:
      return null;
  }
}

export function modalityPaymentBankSeverity(
  statusTransaction: ModalityPaymentBankInput,
): CsTagTone {
  switch (normalizeModalityPaymentBankEnum(statusTransaction)) {
    case ModalityPaymentBankEnum.CASH_DEBIT:
      return 'money';

    case ModalityPaymentBankEnum.CASH_CREDIT:
      return 'success';

    case ModalityPaymentBankEnum.PIX_ENV:
      return 'orange';

    case ModalityPaymentBankEnum.PIX_REC:
      return 'info';

    case ModalityPaymentBankEnum.ANTECIP_CRED:
      return 'warn';

    case ModalityPaymentBankEnum.PIX_DEV:
      return 'danger';

    default:
      return 'contrast';
  }
}

export function modalityPaymentBankLabel(
  statusTransaction: ModalityPaymentBankInput,
  i18n: I18nService,
): string {
  switch (normalizeModalityPaymentBankEnum(statusTransaction)) {
    case ModalityPaymentBankEnum.CASH_DEBIT:
      return i18n.tUi('enum.modalityPaymentBank.cashDebit');

    case ModalityPaymentBankEnum.CASH_CREDIT:
      return i18n.tUi('enum.modalityPaymentBank.cashCredit');

    case ModalityPaymentBankEnum.PIX_ENV:
      return i18n.tUi('enum.modalityPaymentBank.pixEnv');

    case ModalityPaymentBankEnum.PIX_REC:
      return i18n.tUi('enum.modalityPaymentBank.pixRec');

    case ModalityPaymentBankEnum.PIX_DEV:
      return i18n.tUi('enum.modalityPaymentBank.pixDev');

    case ModalityPaymentBankEnum.ANTECIP_CRED:
      return i18n.tUi('enum.modalityPaymentBank.antecipCred');

    case ModalityPaymentBankEnum.NULL:
      return i18n.tUi('enum.modalityPaymentBank.null', 'N/A');

    default:
      return i18n.tUi('enum.modalityPaymentBank.unknown');
  }
}

export function allModalityPaymentBankEnum(): ModalityPaymentBankEnum[] {
  return [
    ModalityPaymentBankEnum.CASH_DEBIT,
    ModalityPaymentBankEnum.CASH_CREDIT,
    ModalityPaymentBankEnum.ANTECIP_CRED,
  ];
}
