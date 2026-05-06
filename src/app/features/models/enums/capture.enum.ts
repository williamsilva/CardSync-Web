import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export enum CaptureEnum {
  NULL = 'NULL',
  POS = 'POS',
  PDV = 'PDV',
  MANUAL = 'MANUAL',
  ECOMMERCE = 'ECOMMERCE',
}

export type CaptureInput = CaptureEnum | string | number | null | undefined;

export const STATUS_CODE_MAP: Record<number, CaptureEnum> = {
  0: CaptureEnum.NULL,
  1: CaptureEnum.POS,
  2: CaptureEnum.PDV,
  3: CaptureEnum.MANUAL,
  4: CaptureEnum.ECOMMERCE,
};

export function normalizeCaptureEnum(capture: CaptureInput): CaptureEnum | null {
  if (capture == null) return null;

  if (typeof capture === 'number') {
    return STATUS_CODE_MAP[capture] ?? null;
  }

  const normalized = String(capture).trim().toUpperCase();

  switch (normalized) {
    case CaptureEnum.NULL:
      return CaptureEnum.NULL;

    case CaptureEnum.POS:
      return CaptureEnum.POS;

    case CaptureEnum.PDV:
      return CaptureEnum.PDV;

    case CaptureEnum.MANUAL:
      return CaptureEnum.MANUAL;

    case CaptureEnum.ECOMMERCE:
      return CaptureEnum.ECOMMERCE;

    default:
      return null;
  }
}

export function captureEnumSeverity(capture: CaptureInput): CsTagTone {
  switch (normalizeCaptureEnum(capture)) {
    case CaptureEnum.POS:
      return 'success';

    case CaptureEnum.PDV:
      return 'warn';

    case CaptureEnum.MANUAL:
      return 'danger';

    case CaptureEnum.ECOMMERCE:
    default:
      return 'contrast';
  }
}

export function captureEnumLabel(capture: CaptureInput, i18n: I18nService): string {
  switch (normalizeCaptureEnum(capture)) {
    case CaptureEnum.POS:
      return i18n.tUi('enum.captureEnum.pos');

    case CaptureEnum.PDV:
      return i18n.tUi('enum.captureEnum.pdv');

    case CaptureEnum.MANUAL:
      return i18n.tUi('enum.captureEnum.manual');

    case CaptureEnum.ECOMMERCE:
      return i18n.tUi('enum.captureEnum.ecommerce');

    case CaptureEnum.NULL:
      return i18n.tUi('enum.captureEnum.null', 'N/A');

    default:
      return i18n.tUi('enum.captureEnum.unknown');
  }
}

export function allCaptureEnum(): CaptureEnum[] {
  return [CaptureEnum.POS, CaptureEnum.PDV, CaptureEnum.MANUAL, CaptureEnum.ECOMMERCE];
}
