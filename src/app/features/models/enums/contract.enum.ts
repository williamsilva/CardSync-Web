import { I18nService } from '@core/i18n/i18n.service';

export enum ContractEnum {
  NULL = 'NULL',
  VALIDITY = 'VALIDITY',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
}

export type ContractInput = ContractEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, ContractEnum> = {
  0: ContractEnum.NULL,
  1: ContractEnum.VALIDITY,
  2: ContractEnum.EXPIRED,
  3: ContractEnum.CLOSED,
};

export function normalizeContractEnum(status: ContractInput): ContractEnum | null {
  if (status == null) return null;

  if (typeof status === 'number') {
    return STATUS_CODE_MAP[status] ?? null;
  }

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case ContractEnum.NULL:
      return ContractEnum.NULL;
    case ContractEnum.VALIDITY:
      return ContractEnum.VALIDITY;
    case ContractEnum.EXPIRED:
      return ContractEnum.EXPIRED;
    case ContractEnum.CLOSED:
      return ContractEnum.CLOSED;

    default:
      return null;
  }
}

export function isActive(status: ContractInput): boolean {
  return normalizeContractEnum(status) === ContractEnum.VALIDITY;
}

export function isInactive(status: ContractInput): boolean {
  return normalizeContractEnum(status) === ContractEnum.EXPIRED;
}

export function isBlocked(status: ContractInput): boolean {
  return normalizeContractEnum(status) === ContractEnum.CLOSED;
}

export function canLogin(status: ContractInput): boolean {
  return normalizeContractEnum(status) === ContractEnum.VALIDITY;
}

export function contractEnumSeverity(
  status: ContractInput,
): 'success' | 'danger' | 'warn' | 'contrast' | 'info' {
  switch (normalizeContractEnum(status)) {
    case ContractEnum.VALIDITY:
      return 'success';

    case ContractEnum.CLOSED:
      return 'warn';

    case ContractEnum.EXPIRED:
      return 'danger';

    case ContractEnum.NULL:
    default:
      return 'contrast';
  }
}

export function contractEnumLabel(status: ContractInput, i18n: I18nService): string {
  switch (normalizeContractEnum(status)) {
    case ContractEnum.VALIDITY:
      return i18n.tUi('enum.contractEnum.validity');

    case ContractEnum.EXPIRED:
      return i18n.tUi('enum.contractEnum.expired');

    case ContractEnum.CLOSED:
      return i18n.tUi('enum.contractEnum.closed');

    case ContractEnum.NULL:
      return i18n.tUi('enum.contractEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.contractEnum.unknown', 'Desconhecido');
  }
}

export function allContractEnum(): ContractEnum[] {
  return [ContractEnum.VALIDITY, ContractEnum.EXPIRED, ContractEnum.CLOSED];
}
