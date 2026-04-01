import { I18nService } from '@core/i18n/i18n.service';

export enum StatusEnum {
  NULL = 'NULL',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export type StatusInput = StatusEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, StatusEnum> = {
  0: StatusEnum.NULL,
  1: StatusEnum.ACTIVE,
  2: StatusEnum.INACTIVE,
  3: StatusEnum.BLOCKED,
};

export function normalizeStatusEnum(status: StatusInput): StatusEnum | null {
  if (status == null) return null;

  if (typeof status === 'number') {
    return STATUS_CODE_MAP[status] ?? null;
  }

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case StatusEnum.NULL:
      return StatusEnum.NULL;
    case StatusEnum.ACTIVE:
      return StatusEnum.ACTIVE;
    case StatusEnum.INACTIVE:
      return StatusEnum.INACTIVE;
    case StatusEnum.BLOCKED:
      return StatusEnum.BLOCKED;

    default:
      return null;
  }
}

export function isActive(status: StatusInput): boolean {
  return normalizeStatusEnum(status) === StatusEnum.ACTIVE;
}

export function isInactive(status: StatusInput): boolean {
  return normalizeStatusEnum(status) === StatusEnum.INACTIVE;
}

export function isBlocked(status: StatusInput): boolean {
  return normalizeStatusEnum(status) === StatusEnum.BLOCKED;
}

export function canLogin(status: StatusInput): boolean {
  return normalizeStatusEnum(status) === StatusEnum.ACTIVE;
}

export function statusEnumSeverity(
  status: StatusInput,
): 'success' | 'danger' | 'warn' | 'contrast' | 'info' {
  switch (normalizeStatusEnum(status)) {
    case StatusEnum.ACTIVE:
      return 'success';

    case StatusEnum.BLOCKED:
      return 'warn';

    case StatusEnum.INACTIVE:
      return 'danger';

    case StatusEnum.NULL:
    default:
      return 'contrast';
  }
}

export function statusEnumLabel(status: StatusInput, i18n: I18nService): string {
  switch (normalizeStatusEnum(status)) {
    case StatusEnum.ACTIVE:
      return i18n.tUi('enum.statusEnum.active');

    case StatusEnum.INACTIVE:
      return i18n.tUi('enum.statusEnum.inactive');

    case StatusEnum.BLOCKED:
      return i18n.tUi('enum.statusEnum.blocked');

    case StatusEnum.NULL:
      return i18n.tUi('enum.statusEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.statusEnum.unknown', 'Desconhecido');
  }
}

export function allStatusEnum(): StatusEnum[] {
  return [StatusEnum.ACTIVE, StatusEnum.INACTIVE, StatusEnum.BLOCKED];
}
