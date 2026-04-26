import { computed, signal, WritableSignal } from '@angular/core';

import { Table } from 'primeng/table';

import { I18nService } from '@core/i18n/i18n.service';
import { PeriodEnum } from '@models/enums/period.enum';
import { DatePickerTypeView } from 'primeng/datepicker';
import { BaseListPage } from '@shared/features/list-base/base-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { mapPrimeLazyToTableQuery } from '@shared/features/list-query/primeng-lazy.mapper';
import {
  ActiveFilterItem,
  ActiveFilterGroup,
} from '@shared/features/filters-panel/filters-panel.component';

export abstract class StatefulListPage<
  TState extends object,
  TAdvancedFilter extends object,
> extends BaseListPage<TState> {
  protected abstract readonly i18n: I18nService;

  protected static readonly DEFAULT_ROWS = 15;

  protected searchedOnce = false;
  protected skipNextLazy = false;
  protected lastLazyEvent: any | null = null;

  readonly tableFiltersState = signal<any | null>(null);

  readonly tableActiveFilters = computed<ActiveFilterItem[]>(() =>
    this.mapTableFiltersToActiveItems(this.tableFiltersState()),
  );

  abstract rows: number;
  public rowsPerPageOptions: number[] = [10, 15, 20, 30, 50, 100];

  protected abstract tableRowsKey(): string;
  protected abstract tableStateKey(): string;

  protected abstract loadFirstPage(): void;

  protected abstract buildAdvancedFilters(): Partial<TAdvancedFilter>;
  protected abstract mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[];
  protected abstract loadPage(query: ReturnType<typeof buildListQuery<TAdvancedFilter>>): void;
  protected abstract advancedActiveFilters: () => ActiveFilterItem[];

  protected onAfterClear(): void {}
  protected clearCustomTableState(_defaultRows: number): void {}

  readonly activeFilterGroups = computed<ActiveFilterGroup[]>(() => {
    const groups: ActiveFilterGroup[] = [];
    const advanced = this.advancedActiveFilters();
    const table = this.tableActiveFilters();

    if (advanced.length) {
      groups.push({ title: this.i18n.tUi('common.advancedFilters'), filters: advanced });
    }

    if (table.length) {
      groups.push({ title: this.i18n.tUi('common.tableFilters'), filters: table });
    }

    return groups;
  });

  readonly activeFiltersCount = computed(
    () => this.advancedActiveFilters().length + this.tableActiveFilters().length,
  );

  search(): void {
    this.persistFilters();
    this.searchedOnce = true;

    if (this.lastLazyEvent) {
      this.lastLazyEvent = { ...this.lastLazyEvent, first: 0 };
    }

    this.reloadWithCurrentState();
  }

  clearTableAndReload(dt?: Table): void {
    this.clearAndPersist();
    this.searchedOnce = true;

    this.rows = StatefulListPage.DEFAULT_ROWS;
    localStorage.setItem(this.tableRowsKey(), String(this.rows));

    if (dt) {
      dt.first = 0;
      dt.rows = this.rows;

      if (typeof dt.reset === 'function') {
        dt.reset();
      } else {
        dt.clear();
      }

      const tableAny = dt as any;
      if (typeof tableAny.clearState === 'function') {
        tableAny.clearState();
      }
    } else {
      this.clearCustomTableState(this.rows);
    }

    localStorage.removeItem(this.tableStateKey());

    this.tableFiltersState.set(null);

    this.lastLazyEvent = {
      first: 0,
      rows: this.rows,
      filters: undefined,
      globalFilter: null,
      sortField: undefined,
      sortOrder: undefined,
      multiSortMeta: undefined,
    };

    this.onAfterClear();
    this.reloadWithCurrentState();
  }

  onPageChange(event: any): void {
    this.rows = event.rows;
    localStorage.setItem(this.tableRowsKey(), String(this.rows));
  }

  onLazyLoad(e: any): void {
    this.lastLazyEvent = e;
    this.tableFiltersState.set(this.cloneTableFilters(e?.filters));

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

  setViewFormat(period: PeriodEnum | null): DatePickerTypeView {
    switch (period) {
      case PeriodEnum.MONTH:
        return 'month';
      case PeriodEnum.YEAR:
        return 'year';
      default:
        return 'date';
    }
  }

  setDateFormat(period: PeriodEnum | null): string {
    switch (period) {
      case PeriodEnum.DAY:
        return 'dd/mm/yy';
      case PeriodEnum.MONTH:
        return 'mm/yy';
      case PeriodEnum.YEAR:
        return 'yy';
      default:
        return 'dd/mm/yy';
    }
  }

  setSelectionMode(period: PeriodEnum | null): 'single' | 'range' {
    return period === PeriodEnum.INTERVAL ? 'range' : 'single';
  }

  setArrayColumnDraft(
    draft: WritableSignal<string[] | null>,
    value: string[] | null | undefined,
  ): void {
    draft.set(value?.length ? value : null);
  }

  applyArrayColumnFilter(
    draft: WritableSignal<string[] | null>,
    filter: (value: unknown) => void,
    columnFilter: unknown,
  ): void {
    const value = draft();

    filter(value?.length ? value : null);

    this.closeColumnFilter(columnFilter);
  }

  clearArrayColumnFilter(
    draft: WritableSignal<string[] | null>,
    filter: (value: unknown) => void,
    columnFilter: unknown,
  ): void {
    draft.set(null);

    filter(null);

    this.closeColumnFilter(columnFilter);
  }

  syncArrayColumnDraftFromTableState(
    filters: any,
    field: string,
    draft: WritableSignal<string[] | null>,
    reader: (filters: any, field: string) => string[],
  ): void {
    const values = reader(filters, field);
    draft.set(values.length ? values : null);
  }

  onPeriodColumnChange(
    periodDraft: WritableSignal<PeriodEnum | null>,
    valueDraft: WritableSignal<string | string[] | null>,
    period: PeriodEnum | null,
  ): void {
    periodDraft.set(period);
    valueDraft.set(null);
  }

  onPeriodColumnDraftChange(
    valueDraft: WritableSignal<string | string[] | null>,
    value: string | string[] | null,
  ): void {
    valueDraft.set(value);
  }

  canApplyPeriodColumnFilter(
    periodDraft: WritableSignal<PeriodEnum | null>,
    valueDraft: WritableSignal<string | string[] | null>,
  ): boolean {
    const period = periodDraft();
    const value = valueDraft();

    if (!period || !value) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.filter(Boolean).length === 2;
    }

    return true;
  }

  applyPeriodColumnFilter(
    periodDraft: WritableSignal<PeriodEnum | null>,
    valueDraft: WritableSignal<string | string[] | null>,
    filter: (value: unknown) => void,
    columnFilter: unknown,
  ): void {
    const period = periodDraft();
    const value = valueDraft();

    if (!period || !value) {
      filter(null);
      this.closeColumnFilter(columnFilter);
      return;
    }

    if (Array.isArray(value)) {
      const normalized = value.filter(Boolean);

      if (normalized.length !== 2) {
        return;
      }

      filter({
        period,
        value: normalized,
      });

      this.closeColumnFilter(columnFilter);
      return;
    }

    filter({
      period,
      value,
    });

    this.closeColumnFilter(columnFilter);
  }

  clearPeriodColumnFilter(
    periodDraft: WritableSignal<PeriodEnum | null>,
    valueDraft: WritableSignal<string | string[] | null>,
    filter: (value: unknown) => void,
    columnFilter: unknown,
  ): void {
    periodDraft.set(null);
    valueDraft.set(null);

    filter(null);

    this.closeColumnFilter(columnFilter);
  }

  syncPeriodColumnDraftFromTableState(
    filters: any,
    field: string,
    periodDraft: WritableSignal<PeriodEnum | null>,
    valueDraft: WritableSignal<string | string[] | null>,
    reader: (
      filters: any,
      field: string,
    ) => { period?: PeriodEnum; value?: string | string[] } | null,
  ): void {
    const value = reader(filters, field);

    periodDraft.set(value?.period ?? null);
    valueDraft.set(value?.value ?? null);
  }

  setTextColumnDraft(
    draft: WritableSignal<string>,
    value: string | null | undefined,
  ): void {
    draft.set((value ?? '').toString());
  }

  applyTextColumnFilter(
    draft: WritableSignal<string>,
    filter: (value: unknown) => void,
    columnFilter: unknown,
  ): void {
    const value = draft().trim();

    filter(value || null);

    this.closeColumnFilter(columnFilter);
  }

  clearTextColumnFilter(
    draft: WritableSignal<string>,
    filter: (value: unknown) => void,
    columnFilter: unknown,
  ): void {
    draft.set('');

    filter(null);

    this.closeColumnFilter(columnFilter);
  }

  syncTextColumnDraftFromTableState(
    filters: any,
    field: string,
    draft: WritableSignal<string>,
    reader: (filters: any, field: string) => string | null,
  ): void {
    draft.set(reader(filters, field) ?? '');
  }

  protected closeColumnFilter(columnFilter: unknown): void {
    const filter = columnFilter as {
      hide?: () => void;
      overlayVisible?: boolean;
    };

    filter.hide?.();
    filter.overlayVisible = false;
  }

  protected cloneTableFilters(filters: any): any | null {
    if (!filters) return null;

    try {
      return structuredClone(filters);
    } catch {
      return JSON.parse(JSON.stringify(filters));
    }
  }

  protected initStatefulList(): void {
    this.restoreTableStateFromStorage();
    this.loadOnInit();

    if (this.advancedActiveFilters().length > 0 || this.hasRestoredTableState()) {
      this.searchedOnce = true;
    }

    this.skipNextLazy = true;
  }

  protected hasRestoredTableState(): boolean {
    return (
      !!this.lastLazyEvent?.filters ||
      this.lastLazyEvent?.sortField != null ||
      (Array.isArray(this.lastLazyEvent?.multiSortMeta) &&
        this.lastLazyEvent.multiSortMeta.length > 0) ||
      this.lastLazyEvent?.globalFilter != null ||
      (this.lastLazyEvent?.first ?? 0) > 0
    );
  }

  protected restoreTableStateFromStorage(): void {
    const raw = localStorage.getItem(this.tableStateKey());
    if (!raw) return;

    const dateFormat = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;

    try {
      const restored = JSON.parse(raw, (_key, value) => {
        if (typeof value === 'string' && dateFormat.test(value)) {
          return new Date(value);
        }
        return value;
      });

      this.lastLazyEvent = {
        first: restored?.first ?? 0,
        rows: restored?.rows ?? this.rows,
        sortField: restored?.sortField,
        sortOrder: restored?.sortOrder,
        multiSortMeta: restored?.multiSortMeta,
        filters: restored?.filters,
        globalFilter: restored?.globalFilter ?? null,
      };

      this.rows = this.lastLazyEvent.rows ?? this.rows;
      localStorage.setItem(this.tableRowsKey(), String(this.rows));
      this.tableFiltersState.set(this.cloneTableFilters(this.lastLazyEvent?.filters));
    } catch {
      this.lastLazyEvent = null;
      this.tableFiltersState.set(null);
    }
  }

  protected reloadWithCurrentState(): void {
    const tableQuery = mapPrimeLazyToTableQuery(
      this.lastLazyEvent ?? { first: 0, rows: this.rows },
      this.rows,
    );

    const query = buildListQuery<TAdvancedFilter>(tableQuery, this.buildAdvancedFilters());

    this.rows = tableQuery.size;
    localStorage.setItem(this.tableRowsKey(), String(this.rows));
    this.loadPage(query);
  }
}
