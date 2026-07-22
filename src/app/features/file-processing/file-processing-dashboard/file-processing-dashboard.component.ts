import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressBarModule } from 'primeng/progressbar';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { boolSeverity as getBoolSeverity } from '../file-processing-ui';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { FileProcessingService } from '@features/service/file-processing.service';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { ProcessedFilesAdvancedFilters } from '@features/filter/processed-files.filters';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ScheduleStatusResponse, FileProcessingTotalsModel } from '@models/file-processing.models';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

type DashboardFiltersState = {
  dateImport: string | string[] | null;
  periodDateImport: PeriodEnum | null;
  group: string[] | null;
};

@Component({
  standalone: true,
  selector: 'cs-file-processing-dashboard',
  styleUrl: './file-processing-dashboard.component.scss',
  templateUrl: './file-processing-dashboard.component.html',
  imports: [
    CsDatePipe,
    CardModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
    TranslateModule,
    ProgressBarModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent
],
})
export class FileProcessingDashboardComponent extends StatefulListPage<
  DashboardFiltersState,
  ProcessedFilesAdvancedFilters
> {
  protected override readonly i18n = inject(I18nService);
  private readonly service = inject(FileProcessingService);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  protected readonly totalsLoading = signal(false);
  protected readonly scheduleLoading = signal(false);
  protected readonly loading = computed(() => this.scheduleLoading() || this.totalsLoading());

  protected readonly processingErp = signal(false);
  protected readonly processingRede = signal(false);
  protected readonly processingBank = signal(false);

  protected readonly schedule = signal<ScheduleStatusResponse | null>(null);
  protected readonly totals = signal<FileProcessingTotalsModel | null>(null);

  readonly group = signal<string[] | null>(null);
  readonly periodDateImport = signal<PeriodEnum | null>(null);
  readonly dateImport = signal<string | string[] | null>(null);

  readonly isDateImportDisabled = computed(() => !this.periodDateImport());

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly groupOptions = [
    { label: 'ERP', value: 'ERP' },
    { label: 'ADQ', value: 'ADQ' },
    { label: 'BANK', value: 'BANK' },
  ];

  protected readonly boolSeverity = getBoolSeverity;

  constructor() {
    super();
    this.loadOnInit();
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.PROCESSED_FILES.DASHBOARD.TABLE.ROWS.V1;
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.PROCESSED_FILES.DASHBOARD.TABLE.STATE.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.PROCESSED_FILES.DASHBOARD.FILTERS.V1;
  }

  protected override refresh(): void {
    this.loadSchedule();
    this.loadTotals();
  }

  protected override resetFilters(): void {
    this.periodDateImport.set(null);
    this.dateImport.set(null);
    this.group.set(null);
  }

  protected override toFiltersState(): DashboardFiltersState {
    return {
      dateImport: this.dateImport(),
      periodDateImport: this.periodDateImport(),
      group: this.group(),
    };
  }

  protected override applyFiltersState(state: DashboardFiltersState): void {
    this.dateImport.set(state.dateImport ?? null);
    this.periodDateImport.set(state.periodDateImport ?? null);
    this.group.set(state.group ?? null);
  }

  protected override loadFirstPage(): void {
    this.loadTotals();
  }

  protected override loadPage(
    _query: ReturnType<typeof buildListQuery<ProcessedFilesAdvancedFilters>>,
  ): void {
    this.loadTotals();
  }

  protected override buildAdvancedFilters(): Partial<ProcessedFilesAdvancedFilters> {
    const filters: Partial<ProcessedFilesAdvancedFilters> = {};
    if (this.periodDateImport()) filters.periodDateImport = this.periodDateImport()!;
    if (this.dateImport()) filters.dateImport = this.dateImport()!;
    if (this.group()?.length) filters.group = this.group()!;
    return filters;
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];
    const period = this.periodDateImport();
    if (period) {
      const label = this.formatActiveFilterPeriodDateValue(period, this.dateImport(), this.i18n);
      items.push({
        label: this.i18n.tUi('processedFiles.fields.periodDateImport'),
        value: label ?? '',
      });
    }
    const group = this.group();
    if (group?.length) {
      items.push({
        label: this.i18n.tUi('processedFiles.fields.origin'),
        value: group.join(', '),
      });
    }
    return items;
  });

  protected override mapTableFiltersToActiveItems(_filters: any): ActiveFilterItem[] {
    return [];
  }

  protected reload(): void {
    this.refresh();
  }

  protected onPeriodChange(period: PeriodEnum | null): void {
    this.periodDateImport.set(period);
    if (!period) this.dateImport.set(null);
  }

  private loadSchedule(): void {
    this.scheduleLoading.set(true);
    this.service.getScheduleStatus().subscribe({
      next: (status) => this.schedule.set(status),
      error: () => this.scheduleLoading.set(false),
      complete: () => this.scheduleLoading.set(false),
    });
  }

  private loadTotals(): void {
    this.totalsLoading.set(true);
    this.service.getFilesTotals(this.buildAdvancedFilters()).subscribe({
      next: (totals) => this.totals.set(totals),
      error: () => this.totalsLoading.set(false),
      complete: () => this.totalsLoading.set(false),
    });
  }
}
