import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum FileGroupEnum {
  ERP = 'ERP',
  ADQ = 'ADQ',
  BANK = 'BANK',
}

export function fileGroupEnumLabel(value: FileGroupEnum | null | undefined, i18n: I18nService): string {
  switch (value) {
    case FileGroupEnum.ERP:
      return i18n.tUi('enum.fileGroupEnum.erp');
    case FileGroupEnum.ADQ:
      return i18n.tUi('enum.fileGroupEnum.adq');
    case FileGroupEnum.BANK:
      return i18n.tUi('enum.fileGroupEnum.bank');
    default:
      return i18n.tUi('enum.fileGroupEnum.unknown', '-');
  }
}

export function fileGroupEnumSeverity(value: FileGroupEnum | null | undefined): CsTagTone {
  switch (value) {
    case FileGroupEnum.ERP:
      return 'info';
    case FileGroupEnum.ADQ:
      return 'success';
    case FileGroupEnum.BANK:
      return 'warn';
    default:
      return 'contrast';
  }
}

export function allFileGroupEnum(): FileGroupEnum[] {
  return [FileGroupEnum.ERP, FileGroupEnum.ADQ, FileGroupEnum.BANK];
}
