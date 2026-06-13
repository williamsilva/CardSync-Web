import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Component, computed, effect, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { I18nService } from '@core/i18n/i18n.service';
import { PeriodEnum } from '@models/enums/period.enum';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { ImportedFilesCalendarFacade } from '@features/facade/imported-files-calendar.facade';
import { createEmptyProcessedFilesFiltersState } from '@features/filter/processed-files.filters';
import {
  FileGroupStatus,
  ImportedFileCalendarDayModel,
  ImportedFileCalendarGroupInfo,
  ImportedFileCalendarItemModel,
} from '@models/file-processing.models';

interface CalendarCell {
  key: string;
  day: ImportedFileCalendarDayModel | null;
}

interface FileCategoryGroup {
  key: string;
  label: string;
  files: ImportedFileCalendarItemModel[];
}

interface MissingByType {
  erp: ImportedFileCalendarDayModel[];
  adq: ImportedFileCalendarDayModel[];
  bank: ImportedFileCalendarDayModel[];
}

@Component({
  standalone: true,
  selector: 'cs-imported-files-calendar',
  styleUrl: './imported-files-calendar.component.scss',
  templateUrl: './imported-files-calendar.component.html',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    CsDatePipe,
    DatePicker,
    FormsModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    ProgressSpinnerModule,
  ],
})
export class ImportedFilesCalendarComponent {
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly translate = inject(TranslateService);
  private readonly facade = inject(ImportedFilesCalendarFacade);

  protected readonly loading = this.facade.loading;
  protected readonly calendar = this.facade.calendar;
  protected readonly selectedMonth = signal(this.currentMonth());
  protected readonly selectedDay = signal<ImportedFileCalendarDayModel | null>(null);

  protected readonly weekdayKeys = [
    'importedFilesCalendar.weekdays.sun',
    'importedFilesCalendar.weekdays.mon',
    'importedFilesCalendar.weekdays.tue',
    'importedFilesCalendar.weekdays.wed',
    'importedFilesCalendar.weekdays.thu',
    'importedFilesCalendar.weekdays.fri',
    'importedFilesCalendar.weekdays.sat',
  ];

  protected readonly selectedMonthDate = computed<Date>(() => {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    return new Date(year, month - 1, 1);
  });

  protected readonly monthLabel = computed(() => {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    return new Intl.DateTimeFormat(this.i18n.getDateLocale(), {
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, 1));
  });

  protected readonly calendarCells = computed<CalendarCell[]>(() => {
    const days = this.calendar()?.days ?? [];
    if (!days.length) return [];

    const [year, month, day] = days[0].date.split('-').map(Number);
    const leading = new Date(year, month - 1, day).getDay();
    const cells: CalendarCell[] = Array.from({ length: leading }, (_, index) => ({
      key: `empty-start-${index}`,
      day: null,
    }));

    days.forEach((calendarDay) => cells.push({ key: calendarDay.date, day: calendarDay }));

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let index = 0; index < trailing; index += 1) {
      cells.push({ key: `empty-end-${index}`, day: null });
    }
    return cells;
  });

  protected readonly selectedGroups = computed<FileCategoryGroup[]>(() => {
    const files = this.selectedDay()?.files ?? [];
    const grouped = new Map<string, FileCategoryGroup>();

    files.forEach((file) => {
      const key = `${file.group}:${file.category}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.files.push(file);
      } else {
        grouped.set(key, { key, label: file.categoryLabel, files: [file] });
      }
    });

    return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  });

  protected readonly missingByType = computed<MissingByType>(() => {
    const past = (this.calendar()?.days ?? []).filter((d) => !d.future);
    return {
      erp: past.filter((d) => this.dayGroupStatus(d, 'erp') !== 'complete'),
      adq: past.filter((d) => this.dayGroupStatus(d, 'adq') !== 'complete'),
      bank: past.filter((d) => this.dayGroupStatus(d, 'bank') !== 'complete'),
    };
  });

  constructor() {
    this.facade.loadCalendar(this.selectedMonth());

    effect(() => {
      const cal = this.facade.calendar();
      if (cal) {
        this.selectedDay.set(cal.days.find((d) => d.hasFiles) ?? cal.days[0] ?? null);
      }
    });
  }

  protected load(): void {
    this.facade.reload(this.selectedMonth());
  }

  protected onMonthPickerChange(date: Date | null): void {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}`;
    this.selectedMonth.set(value);
    this.facade.loadCalendar(value);
  }

  protected previousMonth(): void {
    this.moveMonth(-1);
  }

  protected nextMonth(): void {
    this.moveMonth(1);
  }

  protected selectDay(day: ImportedFileCalendarDayModel): void {
    this.selectedDay.set(day);
  }

  protected dayNumber(date: string): number {
    return Number(date.slice(-2));
  }

  protected statusClass(status: string): string {
    if (status === 'PROCESSED') return 'is-success';
    if (status === 'PROCESSED_WITH_WARNINGS') return 'is-warning';
    if (status === 'ERROR' || status === 'INVALID') return 'is-danger';
    if (status === 'DUPLICATE') return 'is-muted';
    return 'is-info';
  }

  protected dayGroupStatus(
    day: ImportedFileCalendarDayModel,
    group: 'erp' | 'adq' | 'bank',
  ): FileGroupStatus | 'future' {
    if (day.future) return 'future';
    if (day.groupStatus) return day.groupStatus[group].status;
    if (group === 'erp') return day.erpFiles > 0 ? 'complete' : 'missing';
    if (group === 'adq') return day.adqFiles > 0 ? 'complete' : 'missing';
    return day.bankFiles > 0 ? 'complete' : 'missing';
  }

  protected dayGroupInfo(
    day: ImportedFileCalendarDayModel,
    group: 'erp' | 'adq' | 'bank',
  ): ImportedFileCalendarGroupInfo | null {
    return day.groupStatus?.[group] ?? null;
  }

  private readonly STATUS_STYLES: Record<
    string,
    { color: string; background: string; border: string }
  > = {
    complete: {
      color: 'var(--p-green-500)',
      background: 'color-mix(in srgb, var(--p-green-500) 18%, var(--p-content-background))',
      border: '1px solid color-mix(in srgb, var(--p-green-500) 45%, transparent)',
    },
    partial: {
      color: 'var(--p-orange-500)',
      background: 'color-mix(in srgb, var(--p-orange-500) 18%, var(--p-content-background))',
      border: '1px solid color-mix(in srgb, var(--p-orange-500) 45%, transparent)',
    },
    missing: {
      color: 'var(--p-red-500)',
      background: 'color-mix(in srgb, var(--p-red-500) 18%, var(--p-content-background))',
      border: '1px solid color-mix(in srgb, var(--p-red-500) 45%, transparent)',
    },
    future: {
      color: 'var(--p-text-muted-color)',
      background: 'var(--p-content-hover-background)',
      border: '1px solid var(--p-content-border-color)',
    },
  };

  protected pillStyle(
    day: ImportedFileCalendarDayModel,
    group: 'erp' | 'adq' | 'bank',
  ): Record<string, string> {
    const s = this.dayGroupStatus(day, group);
    return this.STATUS_STYLES[s] ?? this.STATUS_STYLES['missing'];
  }

  protected dotColor(day: ImportedFileCalendarDayModel, group: 'erp' | 'adq' | 'bank'): string {
    return (
      this.STATUS_STYLES[this.dayGroupStatus(day, group)]?.color ?? 'var(--p-text-muted-color)'
    );
  }

  private readonly GROUP_LABEL_KEYS: Record<string, string> = {
    erp: 'importedFilesCalendar.groups.erp',
    adq: 'importedFilesCalendar.groups.adq',
    bank: 'importedFilesCalendar.groups.bank',
  };

  protected pillTooltip(day: ImportedFileCalendarDayModel, group: 'erp' | 'adq' | 'bank'): string {
    const status = this.dayGroupStatus(day, group);
    if (status === 'future') return '';

    const t = (key: string) => this.translate.instant(`importedFilesCalendar.tooltip.${key}`);
    const label = this.translate.instant(this.GROUP_LABEL_KEYS[group]);
    const info = this.dayGroupInfo(day, group);

    if (!info) {
      return status === 'complete'
        ? `${label}: ${t('allReceived')}`
        : `${label}: ${t('noneReceived')}`;
    }

    const statusLabel =
      status === 'complete'
        ? t('statusComplete')
        : status === 'partial'
          ? t('statusPartial')
          : t('statusMissing');

    const rows: string[] = [
      `<b>${label}</b> &mdash; ${statusLabel}`,
      `<span style="opacity:.75;font-size:.85em">${t('received')}: ${info.received} / ${info.expected}</span>`,
    ];

    const pending = info.entities.filter((e) => e.status !== 'complete');
    if (pending.length) {
      rows.push(`<span style="opacity:.75;font-size:.85em">${t('pending')}:</span>`);
      for (const e of pending) {
        const icon = e.status === 'partial' ? '◑' : '✗';
        const color = e.status === 'partial' ? 'var(--p-orange-500)' : 'var(--p-red-500)';
        const detail = e.filesReceived > 0 ? ` (${e.filesReceived} ${t('filesAbbrev')})` : '';
        rows.push(`<span style="color:${color}">${icon} ${e.name}${detail}</span>`);
      }
    } else if (status === 'complete') {
      rows.push(`<span style="opacity:.75;font-size:.85em">✓ ${t('allDone')}</span>`);
    }

    return `<div style="line-height:1.8;min-width:150px">${rows.join('<br>')}</div>`;
  }

  protected navigateToFiles(): void {
    const day = this.selectedDay();
    const filters = {
      ...createEmptyProcessedFilesFiltersState(),
      dateImport: day ? day.date : null,
      periodDateImport: day ? PeriodEnum.DAY : null,
    };
    localStorage.setItem(
      STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.FILTERS.V1,
      JSON.stringify(filters),
    );
    const url = this.router.serializeUrl(this.router.createUrlTree(['../files']));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }

  protected overallDayClass(day: ImportedFileCalendarDayModel): Record<string, boolean> {
    if (day.future) return {};
    const erp = this.dayGroupStatus(day, 'erp');
    const adq = this.dayGroupStatus(day, 'adq');
    const bank = this.dayGroupStatus(day, 'bank');
    const allComplete = erp === 'complete' && adq === 'complete' && bank === 'complete';
    const anyMissing = erp === 'missing' || adq === 'missing' || bank === 'missing';
    return {
      'day-all-complete': allComplete,
      'day-has-missing': !allComplete && anyMissing,
      'day-has-partial': !allComplete && !anyMissing,
    };
  }

  protected groupClass(key: string): string {
    if (key.startsWith('ERP:')) return 'group-erp';
    if (key.startsWith('ADQ:')) return 'group-adq';
    if (key.startsWith('BANK:')) return 'group-bank';
    return '';
  }

  private moveMonth(offset: number): void {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.selectedMonth.set(newMonth);
    this.facade.loadCalendar(newMonth);
  }

  private currentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
