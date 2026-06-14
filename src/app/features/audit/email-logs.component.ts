import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { EmailLogsFacade } from '@features/facade/email-logs.facade';
import { EmailLogsFilters } from '@features/filter/email-logs.filters';
import { EmailLogModel, EmailLogsFiltersState } from '@models/email-log.models';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { OverflowTooltipDirective } from '@shared/directives/overflow-tooltip.directive';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import { STATE_KEY } from '@features/state-key.constants';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import {
  readSingleFilterValue,
  readArrayFilterValues,
  readDateRangeFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  EmailLogStatus,
  allEmailLogStatus,
  emailLogStatusLabel,
  emailLogStatusSeverity,
} from '@models/enums/email-log-status.enum';
import {
  allEmailLogEvent,
  EmailLogEventType,
  emailLogEventTypeSeverity,
  emailLogEventTypeStatusLabel,
} from '@models/enums/email-log-event-type.enum';

@Component({
  standalone: true,
  selector: 'app-email-logs',
  templateUrl: './email-logs.component.html',
  imports: [
    CommonModule,
    FloatLabel,
    CsDatePipe,
    TableModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CsTagComponent,
    TranslateModule,
    InputTextModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    FiltersPanelComponent,
    OverflowTooltipDirective,
  ],
})
export class EmailLogsComponent extends StatefulListPage<EmailLogsFiltersState, EmailLogsFilters> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(EmailLogsFacade);

  subject = signal('');
  template = signal('');
  recipient = signal('');
  sentAtRange = signal<Date[] | null>(null);
  status = signal<EmailLogStatus[] | null>(null);
  eventType = signal<EmailLogEventType[] | null>(null);

  override rows = Number(localStorage.getItem('audit.emailLog.table.rows')) || 10;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly emailLogs = computed<EmailLogModel[]>(() => this.facade.emailLogs());

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allEmailLogStatus().map((value) => ({
      label: emailLogStatusLabel(value, this.i18n),
      value,
    }));
  });

  readonly eventTypeOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allEmailLogEvent().map((value) => ({
      label: emailLogEventTypeStatusLabel(value, this.i18n),
      value,
    }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const recipient = this.recipient().trim();
    const subject = this.subject().trim();
    const template = this.template().trim();
    const status = this.status();
    const eventType = this.eventType();
    const sentAtRange = this.sentAtRange();

    if (recipient) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.recipient'),
        value: recipient,
      });
    }

    if (subject) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.subject'),
        value: subject,
      });
    }

    if (template) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.template'),
        value: template,
      });
    }

    if (status?.length) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.status'),
        value: status.map((v) => emailLogStatusLabel(v, this.i18n)).join(', '),
      });
    }

    if (eventType?.length) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.eventType'),
        value: eventType.map((v) => emailLogEventTypeStatusLabel(v, this.i18n)).join(', '),
      });
    }

    if (sentAtRange?.[0] && sentAtRange?.[1]) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.sentAt'),
        value: `${this.formatDate(sentAtRange[0])} – ${this.formatDate(sentAtRange[1])}`,
      });
    }

    return items;
  });

  ngOnInit() {
    this.initStatefulList();
  }

  clear() {
    this.clearTableAndReload(this.dt);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.AUDIT.EMAIL_LOGS.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.AUDIT.EMAIL_LOGS.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.AUDIT.EMAIL_LOGS.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<EmailLogsFilters>(tableQuery as any, this.buildAdvancedFilters());

    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.subject.set('');
    this.template.set('');
    this.recipient.set('');
    this.status.set(null);
    this.eventType.set(null);
    this.sentAtRange.set(null);
  }

  protected override toFiltersState(): EmailLogsFiltersState {
    const sentAtRange = this.sentAtRange();

    return {
      subject: this.subject(),
      template: this.template(),
      recipient: this.recipient(),
      status: this.status()?.length ? this.status() : null,
      eventType: this.eventType()?.length ? this.eventType() : null,
      sentAtRange:
        sentAtRange?.[0] && sentAtRange?.[1]
          ? [sentAtRange[0].toISOString(), sentAtRange[1].toISOString()]
          : null,
    };
  }

  protected override applyFiltersState(s: EmailLogsFiltersState): void {
    this.subject.set(s.subject ?? '');
    this.template.set(s.template ?? '');
    this.recipient.set(s.recipient ?? '');
    this.status.set(s.status ?? null);
    this.eventType.set(s.eventType ?? null);

    this.sentAtRange.set(
      s.sentAtRange?.[0] && s.sentAtRange?.[1]
        ? [new Date(s.sentAtRange[0]), new Date(s.sentAtRange[1])]
        : null,
    );
  }

  protected override buildAdvancedFilters(): Partial<EmailLogsFilters> {
    const sentAtRange = this.sentAtRange();

    const [sentAtFrom, sentAtTo] =
      sentAtRange?.[0] && sentAtRange?.[1]
        ? [sentAtRange[0].toISOString(), sentAtRange[1].toISOString()]
        : [undefined, undefined];

    return {
      subject: this.subject().trim() || undefined,
      template: this.template().trim() || undefined,
      recipient: this.recipient().trim() || undefined,
      status: this.status()?.length ? this.status() : undefined,
      eventType: this.eventType()?.length ? this.eventType() : undefined,
      sentAtFrom,
      sentAtTo,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const subject = readSingleFilterValue(filters, 'subject');
    if (subject) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.subject'),
        value: subject,
      });
    }

    const recipient = readSingleFilterValue(filters, 'recipient');
    if (recipient) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.recipient'),
        value: recipient,
      });
    }

    const template = readSingleFilterValue(filters, 'template');
    if (template) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.template'),
        value: template,
      });
    }

    const errorMessage = readSingleFilterValue(filters, 'errorMessage');
    if (errorMessage) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.columns.errorMessage'),
        value: errorMessage,
      });
    }

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.status'),
        value: statuses
          .map((value) => emailLogStatusLabel(value as EmailLogStatus, this.i18n))
          .join(', '),
      });
    }

    const eventTypes = readArrayFilterValues(filters, 'eventType');
    if (eventTypes.length) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.eventType'),
        value: eventTypes
          .map((value) => emailLogEventTypeStatusLabel(value as EmailLogEventType, this.i18n))
          .join(', '),
      });
    }

    const sentAt = readDateRangeFilterValue(filters, 'sentAt', this.formatDate.bind(this));
    if (sentAt) {
      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.sentAt'),
        value: sentAt,
      });
    }

    return items;
  }

  protected override loadPage(query: ReturnType<typeof buildListQuery<EmailLogsFilters>>): void {
    this.facade.loadPage(query);
  }

  statusLabel(status: EmailLogStatus | null) {
    return emailLogStatusLabel(status, this.i18n);
  }

  severityStatus(status: EmailLogStatus | null) {
    return emailLogStatusSeverity(status);
  }

  eventTypeLabel(eventType: EmailLogEventType | null) {
    return emailLogEventTypeStatusLabel(eventType, this.i18n);
  }

  severityEventType(eventType: EmailLogEventType | null) {
    return emailLogEventTypeSeverity(eventType);
  }

  protected formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(date);
  }
}
