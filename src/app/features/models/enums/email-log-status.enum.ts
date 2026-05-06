import { CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';

export type EmailLogStatusInput = EmailLogStatus | string | number | null | undefined;

export enum EmailLogStatus {
  NULL = 'NULL',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export const EMAIL_LOG_STATUS_CODE_MAP: Record<number, EmailLogStatus> = {
  0: EmailLogStatus.NULL,
  1: EmailLogStatus.SENT,
  2: EmailLogStatus.FAILED,
};

export function allEmailLogStatus(): EmailLogStatus[] {
  return [EmailLogStatus.SENT, EmailLogStatus.FAILED];
}

export const STATUS_CODE_MAP: Record<number, EmailLogStatus> = {
  0: EmailLogStatus.NULL,
  1: EmailLogStatus.SENT,
  2: EmailLogStatus.FAILED,
};

export function emailLogStatusSeverity(status: EmailLogStatusInput): CsTagTone {
  switch (normalizeEmailLogStatus(status)) {
    case EmailLogStatus.SENT:
      return 'success';

    case EmailLogStatus.FAILED:
      return 'danger';

    case EmailLogStatus.NULL:
    default:
      return 'contrast';
  }
}

export function emailLogStatusLabel(status: EmailLogStatusInput, i18n: I18nService): string {
  switch (normalizeEmailLogStatus(status)) {
    case EmailLogStatus.SENT:
      return i18n.tUi('audit.emailLog.status.sent');

    case EmailLogStatus.FAILED:
      return i18n.tUi('audit.emailLog.status.failed');

    case EmailLogStatus.NULL:
      return i18n.tUi('audit.emailLog.status.null', 'N/A');

    default:
      return i18n.tUi('audit.emailLog.status.unknown', 'Desconhecido');
  }
}

export function normalizeEmailLogStatus(status: EmailLogStatusInput): EmailLogStatus | null {
  if (status == null) return null;

  if (typeof status === 'number') {
    return STATUS_CODE_MAP[status] ?? null;
  }

  const normalized = String(status).trim().toUpperCase();

  switch (normalized) {
    case EmailLogStatus.NULL:
      return EmailLogStatus.NULL;
    case EmailLogStatus.SENT:
      return EmailLogStatus.SENT;
    case EmailLogStatus.FAILED:
      return EmailLogStatus.FAILED;

    default:
      return null;
  }
}
