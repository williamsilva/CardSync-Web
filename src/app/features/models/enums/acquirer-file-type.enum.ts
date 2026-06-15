import { I18nService } from '@core/i18n/i18n.service';

export enum AcquirerFileTypeEnum {
  GENERIC = 'GENERIC',
  EEVC = 'EEVC',
  EEVD = 'EEVD',
  EEFI = 'EEFI',
}

export function acquirerFileTypeEnumLabel(
  value: AcquirerFileTypeEnum | null | undefined,
  i18n: I18nService,
): string {
  switch (value) {
    case AcquirerFileTypeEnum.GENERIC:
      return i18n.tUi('enum.acquirerFileTypeEnum.generic');
    case AcquirerFileTypeEnum.EEVC:
      return i18n.tUi('enum.acquirerFileTypeEnum.eevc');
    case AcquirerFileTypeEnum.EEVD:
      return i18n.tUi('enum.acquirerFileTypeEnum.eevd');
    case AcquirerFileTypeEnum.EEFI:
      return i18n.tUi('enum.acquirerFileTypeEnum.eefi');
    default:
      return i18n.tUi('enum.acquirerFileTypeEnum.unknown', '-');
  }
}

export function allAcquirerFileTypeEnum(): AcquirerFileTypeEnum[] {
  return [
    AcquirerFileTypeEnum.GENERIC,
    AcquirerFileTypeEnum.EEVC,
    AcquirerFileTypeEnum.EEVD,
    AcquirerFileTypeEnum.EEFI,
  ];
}
