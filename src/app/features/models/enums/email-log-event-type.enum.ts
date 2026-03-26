import { I18nService } from '@core/i18n/i18n.service';

export type EmailLogEventTypeInput = EmailLogEventType | string | number | null | undefined;

export enum EmailLogEventType {
  NULL = 'NULL',
  PASSWORD_RESET = 'PASSWORD_RESET',
  FIRST_PASSWORD = 'FIRST_PASSWORD',
}

export const EMAIL_LOG_STATUS_CODE_MAP: Record<number, EmailLogEventType> = {
  0: EmailLogEventType.NULL,
  1: EmailLogEventType.PASSWORD_RESET,
  2: EmailLogEventType.FIRST_PASSWORD,
};

export function allEmailLogEvent(): EmailLogEventType[] {
  return [EmailLogEventType.PASSWORD_RESET, EmailLogEventType.FIRST_PASSWORD];
}

export const STATUS_CODE_MAP: Record<number, EmailLogEventType> = {
  0: EmailLogEventType.NULL,
  1: EmailLogEventType.FIRST_PASSWORD,
  2: EmailLogEventType.PASSWORD_RESET,
};

export function emailLogEventTypeStatusLabel(
  status: EmailLogEventTypeInput,
  i18n: I18nService,
): string {
  switch (normalizeEmailLogEventType(status)) {
    case EmailLogEventType.FIRST_PASSWORD:
      return i18n.tUi('audit.emailLog.eventType.passwordReset');

    case EmailLogEventType.PASSWORD_RESET:
      return i18n.tUi('audit.emailLog.eventType.firstPassword');

    case EmailLogEventType.NULL:
      return i18n.tUi('audit.emailLog.eventType.null', 'N/A');

    default:
      return i18n.tUi('audit.emailLog.eventType.unknown', 'Desconhecido');
  }
}

export function emailLogEventTypeSeverity(
  status: EmailLogEventTypeInput,
): 'success' | 'danger' | 'warn' | 'contrast' | 'info' {
  switch (normalizeEmailLogEventType(status)) {
    case EmailLogEventType.FIRST_PASSWORD:
      return 'success';

    case EmailLogEventType.PASSWORD_RESET:
      return 'info';

    case EmailLogEventType.NULL:
    default:
      return 'contrast';
  }
}

export function normalizeEmailLogEventType(
  status: EmailLogEventTypeInput,
): EmailLogEventType | null {
  if (status == null) return null;

  if (typeof status === 'number') {
    return STATUS_CODE_MAP[status] ?? null;
  }

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case EmailLogEventType.NULL:
      return EmailLogEventType.NULL;
    case EmailLogEventType.FIRST_PASSWORD:
      return EmailLogEventType.FIRST_PASSWORD;
    case EmailLogEventType.PASSWORD_RESET:
      return EmailLogEventType.PASSWORD_RESET;

    default:
      return null;
  }
}
