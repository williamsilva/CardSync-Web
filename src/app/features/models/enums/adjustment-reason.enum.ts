import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum AdjustmentReasonEnum {
  NULL = 'NULL',
  TX_MAN_TEF = 'TX_MAN_TEF',
  TARIFA_CBK = 'TARIFA_CBK',
  CHARGEBACK = 'CHARGEBACK',
  SALE_DISPUTE = 'SALE_DISPUTE',
  CANCEL_VENDAS = 'CANCEL_VENDAS',
  NAO_TOKENIZADAS = 'NAO_TOKENIZADAS',
  SALES_ANTICIPATION = 'SALES_ANTICIPATION',
  CANCEL_CHBK_MAESTRO = 'CANCEL_CHBK_MAESTRO',
  CANCEL_VENDA_DEBITO = 'CANCEL_VENDA_DEBITO',
  TRF_AD_EXCESSO_CBACK = 'TRF_AD_EXCESSO_CBACK',
  POS_INATIV_CONEC_PIN = 'POS_INATIV_CONEC_PIN',
  AL_POS_PINPAD_TX_CONECT = 'AL_POS_PINPAD_TX_CONECT',
}

export type StatusTransactionInput = AdjustmentReasonEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, AdjustmentReasonEnum> = {
  0: AdjustmentReasonEnum.NULL,
  1: AdjustmentReasonEnum.SALES_ANTICIPATION,
  5: AdjustmentReasonEnum.TX_MAN_TEF,
  9: AdjustmentReasonEnum.CANCEL_CHBK_MAESTRO,
  15: AdjustmentReasonEnum.TARIFA_CBK,
  18: AdjustmentReasonEnum.CANCEL_VENDAS,
  20: AdjustmentReasonEnum.POS_INATIV_CONEC_PIN,
  22: AdjustmentReasonEnum.SALE_DISPUTE,
  23: AdjustmentReasonEnum.CHARGEBACK,
  24: AdjustmentReasonEnum.TRF_AD_EXCESSO_CBACK,
  28: AdjustmentReasonEnum.AL_POS_PINPAD_TX_CONECT,
  29: AdjustmentReasonEnum.NAO_TOKENIZADAS,
  32: AdjustmentReasonEnum.CANCEL_VENDA_DEBITO,
};

export function normalizeAdjustmentReasonEnum(
  statusTransaction: StatusTransactionInput,
): AdjustmentReasonEnum | null {
  if (statusTransaction == null) return null;

  if (typeof statusTransaction === 'number') {
    return STATUS_CODE_MAP[statusTransaction] ?? null;
  }

  const normalized = String(statusTransaction).trim().toUpperCase();

  switch (normalized) {
    case AdjustmentReasonEnum.NULL:
      return AdjustmentReasonEnum.NULL;

    case AdjustmentReasonEnum.TX_MAN_TEF:
      return AdjustmentReasonEnum.TX_MAN_TEF;

    case AdjustmentReasonEnum.CANCEL_VENDAS:
      return AdjustmentReasonEnum.CANCEL_VENDAS;

    case AdjustmentReasonEnum.SALES_ANTICIPATION:
      return AdjustmentReasonEnum.SALES_ANTICIPATION;

    case AdjustmentReasonEnum.SALE_DISPUTE:
      return AdjustmentReasonEnum.SALE_DISPUTE;

    case AdjustmentReasonEnum.CHARGEBACK:
      return AdjustmentReasonEnum.CHARGEBACK;

    case AdjustmentReasonEnum.TARIFA_CBK:
      return AdjustmentReasonEnum.TARIFA_CBK;

    case AdjustmentReasonEnum.NAO_TOKENIZADAS:
      return AdjustmentReasonEnum.NAO_TOKENIZADAS;

    default:
      return null;
  }
}

export function adjustmentReasonEnumSeverity(statusTransaction: StatusTransactionInput): CsTagTone {
  switch (normalizeAdjustmentReasonEnum(statusTransaction)) {
    case AdjustmentReasonEnum.TX_MAN_TEF:
      return 'warn';

    case AdjustmentReasonEnum.SALES_ANTICIPATION:
      return 'success';

    case AdjustmentReasonEnum.TARIFA_CBK:
      return 'orange';

    case AdjustmentReasonEnum.CANCEL_VENDAS:
      return 'info';

    case AdjustmentReasonEnum.CHARGEBACK:
      return 'danger';

    case AdjustmentReasonEnum.SALE_DISPUTE:
      return 'blue';

    case AdjustmentReasonEnum.NAO_TOKENIZADAS:
      return 'money';

    default:
      return 'contrast';
  }
}

export function adjustmentReasonEnumLabel(
  statusTransaction: StatusTransactionInput,
  i18n: I18nService,
): string {
  switch (normalizeAdjustmentReasonEnum(statusTransaction)) {
    case AdjustmentReasonEnum.TX_MAN_TEF:
      return i18n.tUi('enum.adjustmentReasonEnum.txManTef');

    case AdjustmentReasonEnum.SALES_ANTICIPATION:
      return i18n.tUi('enum.adjustmentReasonEnum.salesAnticipation');

    case AdjustmentReasonEnum.TARIFA_CBK:
      return i18n.tUi('enum.adjustmentReasonEnum.tarifaCbk');

    case AdjustmentReasonEnum.CANCEL_VENDAS:
      return i18n.tUi('enum.adjustmentReasonEnum.cancelVendas');

    case AdjustmentReasonEnum.CHARGEBACK:
      return i18n.tUi('enum.adjustmentReasonEnum.chargeback');

    case AdjustmentReasonEnum.SALE_DISPUTE:
      return i18n.tUi('enum.adjustmentReasonEnum.saleDispute');

    case AdjustmentReasonEnum.NAO_TOKENIZADAS:
      return i18n.tUi('enum.adjustmentReasonEnum.naoTokenizadas');

    case AdjustmentReasonEnum.NULL:
      return i18n.tUi('enum.adjustmentReasonEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.adjustmentReasonEnum.unknown');
  }
}

export function allAdjustmentReasonEnum(): AdjustmentReasonEnum[] {
  return [
    AdjustmentReasonEnum.SALES_ANTICIPATION,
    AdjustmentReasonEnum.CANCEL_VENDAS,
    AdjustmentReasonEnum.NAO_TOKENIZADAS,
    AdjustmentReasonEnum.TX_MAN_TEF,
    AdjustmentReasonEnum.SALE_DISPUTE,
    AdjustmentReasonEnum.CHARGEBACK,
    AdjustmentReasonEnum.TARIFA_CBK,
  ];
}
