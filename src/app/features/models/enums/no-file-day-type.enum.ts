import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum NoFileDayTypeEnum {
  NULL = 'NULL',
  NO_MOVEMENT = 'NO_MOVEMENT',
  HOLIDAY = 'HOLIDAY',
  SYSTEM_OUTAGE = 'SYSTEM_OUTAGE',
  OTHER = 'OTHER',
}

export function normalizeNoFileDayTypeEnum(value: any): NoFileDayTypeEnum | null {
  if (!value || value === NoFileDayTypeEnum.NULL) return null;
  if (Object.values(NoFileDayTypeEnum).includes(value as NoFileDayTypeEnum)) {
    return value as NoFileDayTypeEnum;
  }
  return null;
}

export function noFileDayTypeEnumLabel(value: NoFileDayTypeEnum | null | undefined, i18n: I18nService): string {
  switch (value) {
    case NoFileDayTypeEnum.NO_MOVEMENT:
      return i18n.tUi('enum.noFileDayTypeEnum.noMovement');
    case NoFileDayTypeEnum.HOLIDAY:
      return i18n.tUi('enum.noFileDayTypeEnum.holiday');
    case NoFileDayTypeEnum.SYSTEM_OUTAGE:
      return i18n.tUi('enum.noFileDayTypeEnum.systemOutage');
    case NoFileDayTypeEnum.OTHER:
      return i18n.tUi('enum.noFileDayTypeEnum.other');
    case NoFileDayTypeEnum.NULL:
    default:
      return i18n.tUi('enum.noFileDayTypeEnum.null', 'N/A');
  }
}

export function noFileDayTypeEnumSeverity(value: NoFileDayTypeEnum | null | undefined): CsTagTone {
  switch (value) {
    case NoFileDayTypeEnum.NO_MOVEMENT:
      return 'secondary';
    case NoFileDayTypeEnum.HOLIDAY:
      return 'info';
    case NoFileDayTypeEnum.SYSTEM_OUTAGE:
      return 'danger';
    case NoFileDayTypeEnum.OTHER:
      return 'warn';
    default:
      return 'contrast';
  }
}

export function allNoFileDayTypeEnum(): NoFileDayTypeEnum[] {
  return [
    NoFileDayTypeEnum.NO_MOVEMENT,
    NoFileDayTypeEnum.HOLIDAY,
    NoFileDayTypeEnum.SYSTEM_OUTAGE,
    NoFileDayTypeEnum.OTHER,
  ];
}
