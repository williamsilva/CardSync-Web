import { I18nService } from '@core/i18n/i18n.service';

export enum TypeCompanyEnum {
  NULL = 'NULL',
  MATRIZ = 'MATRIZ',
  FILIAL = 'FILIAL',
}

export type TypeCompanyEnumInput = TypeCompanyEnum | string | number | null | undefined;

export const TYPE_COMPANY_STATUS_CODE_MAP: Record<number, TypeCompanyEnum> = {
  0: TypeCompanyEnum.NULL,
  1: TypeCompanyEnum.MATRIZ,
  2: TypeCompanyEnum.FILIAL,
};

export function normalizeTypeCompanyEnum(status: TypeCompanyEnumInput): TypeCompanyEnum | null {
  if (status == null) return null;

  if (typeof status === 'number') {
    return TYPE_COMPANY_STATUS_CODE_MAP[status] ?? null;
  }

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case TypeCompanyEnum.NULL:
      return TypeCompanyEnum.NULL;

    case TypeCompanyEnum.MATRIZ:
      return TypeCompanyEnum.MATRIZ;

    case TypeCompanyEnum.FILIAL:
      return TypeCompanyEnum.FILIAL;

    default:
      return null;
  }
}

export function isMatriz(status: TypeCompanyEnumInput): boolean {
  return normalizeTypeCompanyEnum(status) === TypeCompanyEnum.MATRIZ;
}

export function isFilial(status: TypeCompanyEnumInput): boolean {
  return normalizeTypeCompanyEnum(status) === TypeCompanyEnum.FILIAL;
}

export function typeCompanySeverity(
  status: TypeCompanyEnumInput,
): 'success' | 'danger' | 'warn' | 'contrast' | 'info' {
  switch (normalizeTypeCompanyEnum(status)) {
    case TypeCompanyEnum.MATRIZ:
      return 'success';

    case TypeCompanyEnum.FILIAL:
      return 'info';

    case TypeCompanyEnum.NULL:
    default:
      return 'contrast';
  }
}

export function typeCompanyEnumLabel(status: TypeCompanyEnumInput, i18n: I18nService): string {
  switch (normalizeTypeCompanyEnum(status)) {
    case TypeCompanyEnum.MATRIZ:
      return i18n.tUi('enum.typeCompanyEnum.matriz');

    case TypeCompanyEnum.FILIAL:
      return i18n.tUi('enum.typeCompanyEnum.filial');

    case TypeCompanyEnum.NULL:
      return i18n.tUi('enum.typeCompanyEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.typeCompanyEnum.unknown', 'Desconhecido');
  }
}

export function allTypeCompanyEnum(): TypeCompanyEnum[] {
  return [TypeCompanyEnum.MATRIZ, TypeCompanyEnum.FILIAL];
}
