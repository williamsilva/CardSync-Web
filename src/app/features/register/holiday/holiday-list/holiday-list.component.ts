import { FormsModule } from '@angular/forms';

import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { HolidayFacade } from '@features/facade/holiday.facade';
import { HolidayAdvancedFilters } from '@features/filter/holiday.filters';
import { STATE_KEY } from '@features/state-key.constants';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { HolidayModel, HolidayFiltersState } from '@models/holiday.models';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { HolidayPermissionPolicy } from '@features/security/policy/holiday-permission.policy';
import { HolidayCreateDialogComponent } from '../holiday-create/holiday-create-dialog.component';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
} from '@models/enums/status.enum';
import {
  readArrayFilterValues,
  readSingleFilterValue,
  readDateRangeFilterValue,
} from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  imports: [
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    PanelModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CheckboxModule,
    SkeletonModule,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    DATA_TABLE_SHELL_IMPORTS,
    HolidayCreateDialogComponent
],
})
export class HolidayListComponent extends StatefulListPage<
  HolidayFiltersState,
  HolidayAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(HolidayFacade);
  protected readonly secPolicy = inject(HolidayPermissionPolicy);
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: HolidayListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 8 });

  name = signal('');
  holidayDateRange = signal<Date[] | null>(null);
  statusEnum = signal<StatusEnum[] | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<HolidayModel[]>([]);
  holiday = signal<HolidayModel | null>(null);

  totalRecords = computed(() => this.facade.totalRecords());
  holidays = computed<HolidayModel[]>(() => this.facade.holidays());

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const name = this.name().trim();
    const statusEnum = this.statusEnum();
    const range = this.holidayDateRange();

    if (name) {
      items.push({ label: this.i18n.tUi('holiday.fields.name'), value: name });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('holiday.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (range?.[0] && range?.[1]) {
      items.push({
        label: this.i18n.tUi('holiday.fields.holidayDate'),
        value: `${this.formatDate(range[0])} – ${this.formatDate(range[1])}`,
      });
    }

    return items;
  });

  selectionStatus = computed<StatusEnum | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy.selectableStatus(selected[0]);
  });

  headerEligibleRows = computed(() => {
    const selectedStatus = this.selectionStatus();
    if (!selectedStatus) return [];
    return this.holidays().filter((row) => this.secPolicy.canSelectForStatus(row, selectedStatus));
  });

  headerChecked = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;
    return eligible.every((row) => this.isRowSelected(row));
  });

  headerIndeterminate = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;
    const count = eligible.filter((row) => this.isRowSelected(row)).length;
    return count > 0 && count < eligible.length;
  });

  canActivateSelected = computed(() => {
    const status = this.selectionStatus();
    return (
      (status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED) &&
      this.secPolicy.canActivateBulk(this.selectedRows())
    );
  });

  canDeactivateSelected = computed(() => {
    const status = this.selectionStatus();
    return status === StatusEnum.ACTIVE && this.secPolicy.canDeactivateBulk(this.selectedRows());
  });

  canBlockSelected = computed(() => {
    const status = this.selectionStatus();
    return status === StatusEnum.ACTIVE && this.secPolicy.canBlockBulk(this.selectedRows());
  });

  selectionModeLabel = computed(() => {
    const status = this.selectionStatus();
    if (status === StatusEnum.ACTIVE) return this.i18n.tUi('enum.statusEnum.active');
    if (status === StatusEnum.INACTIVE) return this.i18n.tUi('enum.statusEnum.inactive');
    if (status === StatusEnum.BLOCKED) return this.i18n.tUi('enum.statusEnum.blocked');
    return this.i18n.tUi('holiday.selection.mode.none');
  });

  ngOnInit() {
    this.initStatefulList();
  }

  clear() {
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: HolidayModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
  }

  isRowSelected(row: HolidayModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: HolidayModel, checked: boolean): void {
    const current = this.selectedRows();
    if (!checked) {
      this.selectedRows.set(current.filter((item) => item.id !== row.id));
      return;
    }
    const rowStatus = this.secPolicy.selectableStatus(row);
    if (!rowStatus) return;
    if (!current.length) { this.selectedRows.set([row]); return; }
    if (rowStatus !== this.selectionStatus()) return;
    if (this.isRowSelected(row)) return;
    this.selectedRows.set([...current, row]);
  }

  toggleHeaderSelection(checked: boolean): void {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return;
    if (!checked) { this.clearSelection(); return; }
    this.selectedRows.set([...eligible]);
  }

  activate(row: HolidayModel): void {
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('holiday.activate.successSingle'),
    );
  }

  deactivate(row: HolidayModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('holiday.deactivate.successSingle'),
    );
  }

  block(row: HolidayModel): void {
    this.bulk.executeAction(
      this.facade.block(row.id),
      this.i18n.tUi('holiday.block.successSingle'),
    );
  }

  confirmActivate(row: HolidayModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('holiday.activate.header'),
      message: this.i18n.tUi('holiday.activate.messageSingle', { name: row.name }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: HolidayModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('holiday.deactivate.header'),
      message: this.i18n.tUi('holiday.deactivate.messageSingle', { name: row.name }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: HolidayModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('holiday.block.header'),
      message: this.i18n.tUi('holiday.block.messageSingle', { name: row.name }),
      icon: 'pi pi-lock',
      accept: () => this.block(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.activateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('holiday.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('holiday.deactivate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.blockBulk(rows.map((r) => r.id)),
      this.i18n.tUi('holiday.block.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('holiday.activate.header'),
      message: this.i18n.tUi('holiday.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('holiday.deactivate.header'),
      message: this.i18n.tUi('holiday.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('holiday.block.header'),
      message: this.i18n.tUi('holiday.block.messageBulk', { count: rows.length }),
      icon: 'pi pi-lock',
      accept: () => this.blockSelected(),
    });
  }

  statusEnumLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  severityEnum(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.holiday.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: HolidayModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.holiday.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.holiday.set(null);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.HOLIDAYS.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.HOLIDAYS.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.HOLIDAYS.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const query = buildListQuery<HolidayAdvancedFilters>(
      { page: 0, size: this.rows } as any,
      this.buildAdvancedFilters(),
    );
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.name.set('');
    this.statusEnum.set(null);
    this.holidayDateRange.set(null);
  }

  protected override toFiltersState(): HolidayFiltersState {
    const range = this.holidayDateRange();
    return {
      name: this.name(),
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
      holidayDateRange:
        range?.[0] && range?.[1] ? [range[0].toISOString(), range[1].toISOString()] : null,
    };
  }

  protected override applyFiltersState(s: HolidayFiltersState): void {
    this.name.set(s.name ?? '');
    this.statusEnum.set(s.statusEnum ?? null);
    this.holidayDateRange.set(
      s.holidayDateRange?.[0] && s.holidayDateRange?.[1]
        ? [new Date(s.holidayDateRange[0]), new Date(s.holidayDateRange[1])]
        : null,
    );
  }

  protected override buildAdvancedFilters(): Partial<HolidayAdvancedFilters> {
    const range = this.holidayDateRange();
    const [from, to] =
      range?.[0] && range?.[1]
        ? [range[0].toISOString(), range[1].toISOString()]
        : [undefined, undefined];

    return {
      name: this.name().trim() || undefined,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,
      holidayDateFrom: from,
      holidayDateTo: to,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const name = readSingleFilterValue(filters, 'name');
    if (name) items.push({ label: this.i18n.tUi('holiday.fields.name'), value: name });

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('holiday.fields.statusEnum'),
        value: statuses.map((v) => statusEnumLabel(v as StatusEnum, this.i18n)).join(', '),
      });
    }

    const dateRange = readDateRangeFilterValue(filters, 'holidayDate', this.formatDate.bind(this));
    if (dateRange) items.push({ label: this.i18n.tUi('holiday.fields.holidayDate'), value: dateRange });

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<HolidayAdvancedFilters>>,
  ): void {
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }

  protected formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    return new Intl.DateTimeFormat(this.i18n.getLang(), { dateStyle: 'short' }).format(date);
  }
}
