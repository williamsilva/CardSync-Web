import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { EmailLogsFacade } from '@features/facade/email-logs.facade';
import { EmailLogsFilters } from '@features/filter/email-logs.filters';
import { BaseListPage } from '@shared/features/list-base/base-list-page';
import { EmailLogModel, EmailLogsFiltersState } from '@models/email-log.models';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';
import { FiltersPanelComponent } from '@shared/features/filters-panel/filters-panel.component';
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
    TagModule,
    FloatLabel,
    CsDatePipe,
    CardModule,
    TableModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    TranslateModule,
    InputTextModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    ReactiveFormsModule,
    FiltersPanelComponent,
  ],
})
export class EmailLogsComponent extends BaseListPage<EmailLogsFilters> {
  @ViewChild('dt') private dt?: Table;

  private searchedOnce = false;
  private skipNextLazy = false;
  private lastLazyEvent: any | null = null;

  subject = signal('');
  template = signal('');
  recipient = signal('');
  sentAtRange = signal<Date[] | null>(null);
  status = signal<EmailLogStatus[] | null>(null);
  eventType = signal<EmailLogEventType[] | null>(null);
  rows = Number(localStorage.getItem('audit.emailLog.table.rows')) || 10;

  readonly i18n = inject(I18nService);
  readonly facade = inject(EmailLogsFacade);
  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly EmailLogs = computed<EmailLogModel[]>(() => this.facade.emailLogs());

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

  readonly activeFiltersCount = computed(() => {
    let c = 0;
    if (this.recipient().trim()) c++;
    if (this.subject().trim()) c++;
    if (this.template().trim()) c++;
    if (this.status()?.length) c++;
    if (this.eventType()?.length) c++;

    const create = this.sentAtRange();
    if (create?.[0] && create?.[1]) c++;
    return c;
  });

  readonly activeFilters = computed(() => {
    const items: { label: string; value: string }[] = [];

    const status = this.status();
    const subject = this.subject().trim();
    const template = this.template().trim();
    const eventType = this.eventType();
    const recipient = this.recipient().trim();

    if (recipient)
      items.push({ label: this.i18n.tUi('audit.emailLog.fields.recipient'), value: recipient });
    if (subject)
      items.push({ label: this.i18n.tUi('audit.emailLog.fields.subject'), value: subject });
    if (template)
      items.push({ label: this.i18n.tUi('audit.emailLog.fields.template'), value: template });

    if (status?.length) {
      const labels = status.map((v) => emailLogStatusLabel(v, this.i18n)).join(', ');
      items.push({ label: this.i18n.tUi('audit.emailLog.fields.status'), value: labels });
    }

    if (eventType?.length) {
      const labels = eventType.map((v) => emailLogEventTypeStatusLabel(v, this.i18n)).join(', ');
      items.push({ label: this.i18n.tUi('audit.emailLog.fields.eventType'), value: labels });
    }

    const create = this.sentAtRange();
    if (create?.[0] && create?.[1]) {
      const fmt = (d: Date) =>
        new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(d);

      items.push({
        label: this.i18n.tUi('audit.emailLog.fields.sentAt'),
        value: `${fmt(create[0])} – ${fmt(create[1])}`,
      });
    }

    return items;
  });

  ngOnInit() {
    this.loadOnInit();

    if (this.activeFiltersCount() > 0) {
      this.searchedOnce = true;
    }

    this.skipNextLazy = true;
    this.lastLazyEvent = { first: 0, rows: this.rows, filters: undefined, globalFilter: null };
    this.reloadWithCurrentState();
  }

  clear() {
    this.clearAndPersist();
    this.searchedOnce = true;
    this.dt?.clear();

    this.lastLazyEvent = {
      first: 0,
      rows: this.rows,
      filters: undefined,
      globalFilter: null,
      sortField: undefined,
      sortOrder: undefined,
      multiSortMeta: undefined,
    };

    this.reloadWithCurrentState();
  }

  search() {
    this.persistFilters();
    this.searchedOnce = true;

    if (this.lastLazyEvent) {
      this.lastLazyEvent = { ...this.lastLazyEvent, first: 0 };
    }

    this.reloadWithCurrentState();
  }

  onPageChange(event: any) {
    this.rows = event.rows;
    localStorage.setItem('audit.emailLog.table.rows', this.rows.toString());
  }

  onLazyLoad(e: any) {
    this.lastLazyEvent = e;

    if (this.skipNextLazy) {
      this.skipNextLazy = false;
      return;
    }

    const hasTableInteraction =
      !!e?.filters ||
      e?.sortField != null ||
      (Array.isArray(e?.multiSortMeta) && e.multiSortMeta.length > 0) ||
      e?.globalFilter != null;

    if (!this.searchedOnce && this.activeFiltersCount() > 0 && !hasTableInteraction) {
      return;
    }

    this.reloadWithCurrentState();
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

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected reloadWithCurrentState() {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastLazyEvent ?? { first: 0, rows: this.rows },
      this.rows,
    );

    const query = buildListQuery<EmailLogsFilters>(tableQuery, this.buildAdvancedFilters());

    this.rows = tableQuery.size;
    localStorage.setItem('groups.table.rows', this.rows.toString());

    this.facade.loadPage(query);
  }

  protected buildAdvancedFilters(): Partial<EmailLogsFilters> {
    const create = this.sentAtRange();

    const [createFrom, createTo] =
      create?.[0] && create?.[1]
        ? [create[0].toISOString(), create[1].toISOString()]
        : [undefined, undefined];
    return {
      subject: this.subject().trim() || undefined,
      template: this.template().trim() || undefined,
      recipient: this.recipient().trim() || undefined,
      status: this.status()?.length ? this.status() : undefined,
      eventType: this.eventType()?.length ? this.eventType() : undefined,

      sentAtTo: createTo,
      sentAtFrom: createFrom,
    };
  }

  protected override filtersKey(): string {
    return 'cardsync.audit.mailLog.filters.v1';
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
    const create = this.sentAtRange();
    return {
      subject: this.subject(),
      template: this.template(),
      recipient: this.recipient(),
      status: this.status()?.length ? this.status() : null,
      eventType: this.eventType()?.length ? this.eventType() : null,

      sentAtRange:
        create?.[0] && create?.[1] ? [create[0].toISOString(), create[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: EmailLogsFiltersState): void {
    this.subject.set(s.subject ?? '');
    this.status.set(s.status ?? null);
    this.eventType.set(s.eventType ?? null);
    this.template.set(s.template ?? '');
    this.recipient.set(s.recipient ?? '');

    this.sentAtRange.set(
      s.sentAtRange?.[0] && s.sentAtRange?.[1]
        ? [new Date(s.sentAtRange[0]), new Date(s.sentAtRange[1])]
        : null,
    );
  }
}
