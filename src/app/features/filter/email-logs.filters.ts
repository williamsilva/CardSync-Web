import { EmailLogStatus } from '@models/enums/email-log-status.enum';
import { EmailLogEventType } from '@models/enums/email-log-event-type.enum';

export interface EmailLogsFilters {
  subject: string;
  template: string;
  recipient: string;
  status?: EmailLogStatus[] | null;
  eventType?: EmailLogEventType[] | null;

  sentAtTo?: string;
  sentAtFrom?: string;
}
