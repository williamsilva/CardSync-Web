import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { STATE_KEY } from '@features/state-key.constants';
import { NoFileDayFacade } from '@features/facade/no-file-day.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { NoFileDayAdvancedFilters } from '@features/filter/no-file-day.filters';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { NoFileDayModel, NoFileDayFiltersState } from '@models/no-file-day.models';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { NoFileDayPermissionPolicy } from '@features/security/policy/no-file-day-permission.policy';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import { NoFileDayCreateDialogComponent } from '../no-file-day-create/no-file-day-create-dialog.component';
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
  FileGroupEnum,
  allFileGroupEnum,
  fileGroupEnumLabel,
  fileGroupEnumSeverity,
} from '@models/enums/file-group.enum';
import {
  NoFileDayTypeEnum,
  allNoFileDayTypeEnum,
  noFileDayTypeEnumLabel,
  noFileDayTypeEnumSeverity,
} from '@models/enums/no-file-day-type.enum';
import {
  readArrayFilterValues,
  readSingleFilterValue,
  readDateRangeFilterValue,
} from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-no-file-day-list',
  templateUrl: './no-file-day-list.component.html',
  imports: [
    CommonModule,
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
    NoFileDayCreateDialogComponent,
  ],
})
export class NoFileDayListComponent extends StatefulListPage<
  NoFileDayFiltersState,
  NoFileDayAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  readonly facade = inject(NoFileDayFacade);

  protected readonly toast = inject(MessageService);
  protected override readonly i18n = inject(I18nService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(NoFileDayPermissionPolicy);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: NoFileDayListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 8 });

  description = signal('');
  noFileDateRange = signal<Date[] | null>(null);
  statusEnum = signal<StatusEnum[] | null>(null);
  fileGroup = signal<FileGroupEnum[] | null>(null);
  dayType = signal<NoFileDayTypeEnum[] | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<NoFileDayModel[]>([]);
  noFileDay = signal<NoFileDayModel | null>(null);

  totalRecords = computed(() => this.facade.totalRecords());
  noFileDays = computed<NoFileDayModel[]>(() => this.facade.noFileDays());

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly fileGroupOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allFileGroupEnum().map((value) => ({
      label: fileGroupEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly dayTypeOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allNoFileDayTypeEnum().map((value) => ({
      label: noFileDayTypeEnumLabel(value, this.i18n),
      value,
    }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const description = this.description().trim();
    const statusEnum = this.statusEnum();
    const range = this.noFileDateRange();
    const dayType = this.dayType();
    const fileGroup = this.fileGroup();

    if (description) {
      items.push({ label: this.i18n.tUi('noFileDay.fields.description'), value: description });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (range?.[0] && range?.[1]) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.noFileDate'),
        value: `${this.formatDate(range[0])} – ${this.formatDate(range[1])}`,
      });
    }

    if (dayType?.length) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.dayType'),
        value: dayType.map((v) => noFileDayTypeEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (fileGroup?.length) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.fileGroup'),
        value: fileGroup.map((v) => fileGroupEnumLabel(v, this.i18n)).join(', '),
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
    return this.noFileDays().filter((row) =>
      this.secPolicy.canSelectForStatus(row, selectedStatus),
    );
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

  canDeleteSelected = computed(() => this.secPolicy.canDeleteBulk(this.selectedRows()));

  selectionModeLabel = computed(() => {
    const status = this.selectionStatus();
    if (status === StatusEnum.ACTIVE) return this.i18n.tUi('enum.statusEnum.active');
    if (status === StatusEnum.INACTIVE) return this.i18n.tUi('enum.statusEnum.inactive');
    if (status === StatusEnum.BLOCKED) return this.i18n.tUi('enum.statusEnum.blocked');
    return this.i18n.tUi('noFileDay.selection.mode.none');
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

  isRowCheckboxDisabled(row: NoFileDayModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
  }

  isRowSelected(row: NoFileDayModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: NoFileDayModel, checked: boolean): void {
    const current = this.selectedRows();
    if (!checked) {
      this.selectedRows.set(current.filter((item) => item.id !== row.id));
      return;
    }
    const rowStatus = this.secPolicy.selectableStatus(row);
    if (!rowStatus) return;
    if (!current.length) {
      this.selectedRows.set([row]);
      return;
    }
    if (rowStatus !== this.selectionStatus()) return;
    if (this.isRowSelected(row)) return;
    this.selectedRows.set([...current, row]);
  }

  toggleHeaderSelection(checked: boolean): void {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return;
    if (!checked) {
      this.clearSelection();
      return;
    }
    this.selectedRows.set([...eligible]);
  }

  activate(row: NoFileDayModel): void {
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('noFileDay.activate.successSingle'),
    );
  }

  deactivate(row: NoFileDayModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('noFileDay.deactivate.successSingle'),
    );
  }

  delete(row: NoFileDayModel): void {
    this.bulk.executeAction(
      this.facade.delete(row.id),
      this.i18n.tUi('noFileDay.delete.successSingle'),
    );
  }

  confirmActivate(row: NoFileDayModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('noFileDay.activate.header'),
      message: this.i18n.tUi('noFileDay.activate.messageSingle', { name: row.description }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: NoFileDayModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('noFileDay.deactivate.header'),
      message: this.i18n.tUi('noFileDay.deactivate.messageSingle', { name: row.description }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmDelete(row: NoFileDayModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('noFileDay.delete.header'),
      message: this.i18n.tUi('noFileDay.delete.messageSingle', { name: row.description }),
      icon: 'pi pi-trash',
      accept: () => this.delete(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.activateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('noFileDay.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('noFileDay.deactivate.successBulk', { count: rows.length }),
    );
  }

  deleteSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.deleteBulk(rows.map((r) => r.id)),
      this.i18n.tUi('noFileDay.delete.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('noFileDay.activate.header'),
      message: this.i18n.tUi('noFileDay.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('noFileDay.deactivate.header'),
      message: this.i18n.tUi('noFileDay.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmDeleteSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('noFileDay.delete.header'),
      message: this.i18n.tUi('noFileDay.delete.messageBulk', { count: rows.length }),
      icon: 'pi pi-trash',
      accept: () => this.deleteSelected(),
    });
  }

  statusEnumLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  severityEnum(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  fileGroupLabel(value: FileGroupEnum | null) {
    return fileGroupEnumLabel(value, this.i18n);
  }

  fileGroupSeverity(value: FileGroupEnum | null) {
    return fileGroupEnumSeverity(value);
  }

  dayTypeLabel(value: NoFileDayTypeEnum | null) {
    return noFileDayTypeEnumLabel(value, this.i18n);
  }

  dayTypeSeverity(value: NoFileDayTypeEnum | null) {
    return noFileDayTypeEnumSeverity(value);
  }

  formatBankingDomicile(domicile: NoFileDayModel['bankingDomicile']): string {
    if (!domicile) return '-';
    const agency = `${domicile.agency}${domicile.agencyDigit ? '-' + domicile.agencyDigit : ''}`;
    const account = `${domicile.currentAccount}${domicile.accountDigit ? '-' + domicile.accountDigit : ''}`;
    return `Ag. ${agency} / Cc. ${account}`;
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.noFileDay.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: NoFileDayModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.noFileDay.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.noFileDay.set(null);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.NO_FILE_DAY.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.NO_FILE_DAY.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.NO_FILE_DAY.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const query = buildListQuery<NoFileDayAdvancedFilters>(
      { page: 0, size: this.rows } as any,
      this.buildAdvancedFilters(),
    );
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.description.set('');
    this.statusEnum.set(null);
    this.noFileDateRange.set(null);
    this.dayType.set(null);
    this.fileGroup.set(null);
  }

  protected override toFiltersState(): NoFileDayFiltersState {
    const range = this.noFileDateRange();
    return {
      description: this.description(),
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
      noFileDateRange:
        range?.[0] && range?.[1] ? [range[0].toISOString(), range[1].toISOString()] : null,
      dayType: this.dayType()?.length ? this.dayType() : null,
      fileGroup: this.fileGroup()?.length ? this.fileGroup() : null,
    };
  }

  protected override applyFiltersState(s: NoFileDayFiltersState): void {
    this.description.set(s.description ?? '');
    this.statusEnum.set(s.statusEnum ?? null);
    this.noFileDateRange.set(
      s.noFileDateRange?.[0] && s.noFileDateRange?.[1]
        ? [new Date(s.noFileDateRange[0]), new Date(s.noFileDateRange[1])]
        : null,
    );
    this.dayType.set(s.dayType ?? null);
    this.fileGroup.set(s.fileGroup ?? null);
  }

  protected override buildAdvancedFilters(): Partial<NoFileDayAdvancedFilters> {
    const range = this.noFileDateRange();
    const [from, to] =
      range?.[0] && range?.[1]
        ? [range[0].toISOString(), range[1].toISOString()]
        : [undefined, undefined];

    return {
      description: this.description().trim() || undefined,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,
      noFileDateFrom: from,
      noFileDateTo: to,
      dayType: this.dayType()?.length ? this.dayType() : undefined,
      fileGroup: this.fileGroup()?.length ? this.fileGroup() : undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const description = readSingleFilterValue(filters, 'description');
    if (description)
      items.push({ label: this.i18n.tUi('noFileDay.fields.description'), value: description });

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.statusEnum'),
        value: statuses.map((v) => statusEnumLabel(v as StatusEnum, this.i18n)).join(', '),
      });
    }

    const dateRange = readDateRangeFilterValue(filters, 'noFileDate', this.formatDate.bind(this));
    if (dateRange)
      items.push({ label: this.i18n.tUi('noFileDay.fields.noFileDate'), value: dateRange });

    const dayTypes = readArrayFilterValues(filters, 'dayType');
    if (dayTypes.length) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.dayType'),
        value: dayTypes
          .map((v) => noFileDayTypeEnumLabel(v as NoFileDayTypeEnum, this.i18n))
          .join(', '),
      });
    }

    const fileGroups = readArrayFilterValues(filters, 'fileGroup');
    if (fileGroups.length) {
      items.push({
        label: this.i18n.tUi('noFileDay.fields.fileGroup'),
        value: fileGroups.map((v) => fileGroupEnumLabel(v as FileGroupEnum, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<NoFileDayAdvancedFilters>>,
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
