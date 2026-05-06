import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum TypeEstablishmentEnum {
  NULL = 'NULL',
  PDV_TEF = 'PDV_TEF',
  ECOMMERCE = 'ECOMMERCE',
}

export type TypeEstablishmentInput = TypeEstablishmentEnum | string | number | null | undefined;

export const TYPE_ESTABLISHMENT_CODE_MAP: Record<number, TypeEstablishmentEnum> = {
  0: TypeEstablishmentEnum.NULL,
  1: TypeEstablishmentEnum.PDV_TEF,
  2: TypeEstablishmentEnum.ECOMMERCE,
};

export function normalizeTypeEstablishmentEnum(
  typeEstablishment: TypeEstablishmentInput,
): TypeEstablishmentEnum | null {
  if (typeEstablishment == null) return null;

  if (typeof typeEstablishment === 'number') {
    return TYPE_ESTABLISHMENT_CODE_MAP[typeEstablishment] ?? null;
  }

  const normalized = String(typeEstablishment).trim().toUpperCase();

  switch (normalized) {
    case TypeEstablishmentEnum.NULL:
      return TypeEstablishmentEnum.NULL;
    case TypeEstablishmentEnum.PDV_TEF:
      return TypeEstablishmentEnum.PDV_TEF;
    case TypeEstablishmentEnum.ECOMMERCE:
      return TypeEstablishmentEnum.ECOMMERCE;

    default:
      return null;
  }
}

export function isActive(typeEstablishment: TypeEstablishmentInput): boolean {
  return normalizeTypeEstablishmentEnum(typeEstablishment) === TypeEstablishmentEnum.PDV_TEF;
}

export function isInactive(typeEstablishment: TypeEstablishmentInput): boolean {
  return normalizeTypeEstablishmentEnum(typeEstablishment) === TypeEstablishmentEnum.ECOMMERCE;
}

export function isBlocked(typeEstablishment: TypeEstablishmentInput): boolean {
  return normalizeTypeEstablishmentEnum(typeEstablishment) === TypeEstablishmentEnum.ECOMMERCE;
}

export function typeEstablishmentEnumSeverity(
  typeEstablishment: TypeEstablishmentInput,
): CsTagTone {
  switch (normalizeTypeEstablishmentEnum(typeEstablishment)) {
    case TypeEstablishmentEnum.PDV_TEF:
      return 'success';

    case TypeEstablishmentEnum.ECOMMERCE:
      return 'info';

    case TypeEstablishmentEnum.NULL:
    default:
      return 'contrast';
  }
}

export function typeEstablishmentEnumLabel(
  typeEstablishment: TypeEstablishmentInput,
  i18n: I18nService,
): string {
  switch (normalizeTypeEstablishmentEnum(typeEstablishment)) {
    case TypeEstablishmentEnum.PDV_TEF:
      return i18n.tUi('enum.typeEstablishmentEnum.pdvTef');

    case TypeEstablishmentEnum.ECOMMERCE:
      return i18n.tUi('enum.typeEstablishmentEnum.ecommerce');

    case TypeEstablishmentEnum.NULL:
      return i18n.tUi('enum.typeEstablishmentEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.typeEstablishmentEnum.unknown', 'Desconhecido');
  }
}

export function allTypeEstablishmentEnum(): TypeEstablishmentEnum[] {
  return [TypeEstablishmentEnum.PDV_TEF, TypeEstablishmentEnum.ECOMMERCE];
}
