import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum ChargebackRequestStatusEnum {
  AGUARDANDO_DECISAO = 'AGUARDANDO_DECISAO',
  APROVADO = 'APROVADO',
  REPROVADO = 'REPROVADO',
  PENDENTE = 'PENDENTE',
  CANCELADO = 'CANCELADO',
}

export type ChargebackRequestStatusInput =
  | ChargebackRequestStatusEnum
  | string
  | number
  | null
  | undefined;

export const STATUS_CODE_MAP: Record<number, ChargebackRequestStatusEnum> = {
  1: ChargebackRequestStatusEnum.AGUARDANDO_DECISAO,
  2: ChargebackRequestStatusEnum.PENDENTE,
  3: ChargebackRequestStatusEnum.APROVADO,
  4: ChargebackRequestStatusEnum.REPROVADO,
  5: ChargebackRequestStatusEnum.CANCELADO,
};

export function normalizeChargebackRequestStatusEnum(
  value: ChargebackRequestStatusInput,
): ChargebackRequestStatusEnum | null {
  if (value == null) return null;

  if (typeof value === 'number') {
    return STATUS_CODE_MAP[value] ?? null;
  }

  const normalized = String(value).trim().toUpperCase();

  switch (normalized) {
    case ChargebackRequestStatusEnum.AGUARDANDO_DECISAO:
      return ChargebackRequestStatusEnum.AGUARDANDO_DECISAO;

    case ChargebackRequestStatusEnum.APROVADO:
      return ChargebackRequestStatusEnum.APROVADO;

    case ChargebackRequestStatusEnum.REPROVADO:
      return ChargebackRequestStatusEnum.REPROVADO;

    case ChargebackRequestStatusEnum.PENDENTE:
      return ChargebackRequestStatusEnum.PENDENTE;

    case ChargebackRequestStatusEnum.CANCELADO:
      return ChargebackRequestStatusEnum.CANCELADO;

    default:
      return null;
  }
}

export function chargebackRequestStatusEnumSeverity(
  value: ChargebackRequestStatusInput,
): CsTagTone {
  switch (normalizeChargebackRequestStatusEnum(value)) {
    case ChargebackRequestStatusEnum.AGUARDANDO_DECISAO:
      return 'warn';

    case ChargebackRequestStatusEnum.APROVADO:
      return 'success';

    case ChargebackRequestStatusEnum.REPROVADO:
      return 'danger';

    case ChargebackRequestStatusEnum.PENDENTE:
      return 'orange';

    case ChargebackRequestStatusEnum.CANCELADO:
    default:
      return 'contrast';
  }
}

export function chargebackRequestStatusEnumLabel(
  value: ChargebackRequestStatusInput,
  i18n: I18nService,
): string {
  switch (normalizeChargebackRequestStatusEnum(value)) {
    case ChargebackRequestStatusEnum.AGUARDANDO_DECISAO:
      return i18n.tUi('enum.chargebackRequestStatusEnum.aguardandoDecisao');

    case ChargebackRequestStatusEnum.APROVADO:
      return i18n.tUi('enum.chargebackRequestStatusEnum.aprovado');

    case ChargebackRequestStatusEnum.REPROVADO:
      return i18n.tUi('enum.chargebackRequestStatusEnum.reprovado');

    case ChargebackRequestStatusEnum.PENDENTE:
      return i18n.tUi('enum.chargebackRequestStatusEnum.pendente');

    case ChargebackRequestStatusEnum.CANCELADO:
      return i18n.tUi('enum.chargebackRequestStatusEnum.cancelado');

    default:
      return i18n.tUi('enum.chargebackRequestStatusEnum.unknown');
  }
}

export function allChargebackRequestStatusEnum(): ChargebackRequestStatusEnum[] {
  return [
    ChargebackRequestStatusEnum.AGUARDANDO_DECISAO,
    ChargebackRequestStatusEnum.PENDENTE,
    ChargebackRequestStatusEnum.APROVADO,
    ChargebackRequestStatusEnum.REPROVADO,
    ChargebackRequestStatusEnum.CANCELADO,
  ];
}
