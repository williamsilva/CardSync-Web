import { EmailLogStatus } from './enums/email-log-status.enum';
import { EmailLogEventType } from './enums/email-log-event-type.enum';

export interface EmailLogModel {
  id: string;
  subject: string;
  template: string;
  recipient: string;
  status: EmailLogStatus;
  eventType: EmailLogEventType;

  errorMessage?: string | null;
  sentAt: string;

  requestedByName?: string | null;
  requestedByUsername?: string | null;
}

export interface EmailLogsPage {
  content: EmailLogModel[];
  totalElements: number;
  size: number;
  number: number;
}

export type EmailLogsFiltersState = {
  subject: string;
  recipient: string;
  template: string;
  status: EmailLogStatus[] | null;
  eventType: EmailLogEventType[] | null;
  sentAtRange: [string, string] | null;
};
