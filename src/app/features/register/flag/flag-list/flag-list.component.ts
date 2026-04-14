import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { FlagFacade } from '@features/facade/flag.facade';
import { FlagFiltersState, FlagModel } from '@models/flag.models';
import { FlagAdvancedFilters } from '@features/filter/flag.filters';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { FlagCreateDialogComponent } from '../flag-create/flag-create.component';
import { FlagTableComponent } from './components/flag-table/flag-table.component';
import { FlagPermissionPolicy } from '@features/security/policy/flag-permission.policy';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
} from '@models/enums/status.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  readArrayFilterValues,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-flag-list',
  templateUrl: './flag-list.component.html',
  imports: [
    CommonModule,
    TagModule,
    FloatLabel,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CheckboxModule,
    TranslateModule,
    InputTextModule,
    MultiSelectModule,
    FlagTableComponent,
    ConfirmDialogModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    FlagCreateDialogComponent,
  ],
})
export class FlagListComponent extends StatefulListPage<FlagFiltersState, FlagAdvancedFilters> {
  @ViewChild(FlagTableComponent) private flagTable?: FlagTableComponent;

  readonly i18n = inject(I18nService);
  readonly flagFacade = inject(FlagFacade);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly upsertVisible = signal(false);
  readonly flag = signal<FlagModel | null>(null);

  readonly expandedFlagId = signal<string | null>(null);
  readonly expandedRelationType = signal<'companies' | 'acquirers' | null>(null);

  protected readonly secPolicy = inject(FlagPermissionPolicy);

  readonly selectedRows = signal<FlagModel[]>([]);

  readonly name = signal<string | null>('');
  readonly erpCode = signal<number | null>(null);
  readonly statusEnum = signal<StatusEnum[] | null>(null);

  readonly totalRecords = computed(() => this.flagFacade.totalRecords());
  readonly flags = computed<FlagModel[]>(() => this.flagFacade.flag() as FlagModel[]);

  readonly statusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: FlagListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  ngOnInit() {
    this.initStatefulList();
  }

  goNew() {
    this.flag.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: FlagModel) {
    this.flag.set(row);
    this.upsertVisible.set(true);
  }

  onSaved() {
    this.upsertVisible.set(false);
    this.flag.set(null);
    this.flagFacade.reloadLast();
  }

  onUpsertVisibleChange(value: boolean) {
    this.upsertVisible.set(value);
    if (!value) this.flag.set(null);
  }

  onTableSelectionChange(rows: FlagModel[]) {
    this.selectedRows.set(rows);
  }

  toggleCompanies(row: FlagModel) {
    if (this.expandedFlagId() === row.id && this.expandedRelationType() === 'companies') {
      this.expandedFlagId.set(null);
      this.expandedRelationType.set(null);
      return;
    }

    this.expandedFlagId.set(row.id);
    this.expandedRelationType.set('companies');
  }

  toggleAcquirers(row: FlagModel) {
    if (this.expandedFlagId() === row.id && this.expandedRelationType() === 'acquirers') {
      this.expandedFlagId.set(null);
      this.expandedRelationType.set(null);
      return;
    }

    this.expandedFlagId.set(row.id);
    this.expandedRelationType.set('acquirers');
  }

  activate(row: FlagModel): void {
    this.bulk.executeAction(
      this.flagFacade.activate(row.id),
      this.i18n.tUi('flag.activate.successSingle'),
    );
  }

  deactivate(row: FlagModel): void {
    this.bulk.executeAction(
      this.flagFacade.deactivate(row.id),
      this.i18n.tUi('flag.deactivate.successSingle'),
    );
  }

  block(row: FlagModel): void {
    this.bulk.executeAction(
      this.flagFacade.block(row.id),
      this.i18n.tUi('flag.block.successSingle'),
    );
  }

  confirmActivate(row: FlagModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('flag.activate.header'),
      message: this.i18n.tUi('flag.activate.messageSingle', {
        name: row?.name ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: FlagModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('flag.deactivate.header'),
      message: this.i18n.tUi('flag.deactivate.messageSingle', {
        name: row?.name ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: FlagModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('flag.block.header'),
      message: this.i18n.tUi('flag.block.messageSingle', {
        name: row?.name ?? row?.id ?? '',
      }),
      icon: 'pi pi-lock',
      accept: () => this.block(row),
    });
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('flag.activate.header'),
      message: this.i18n.tUi('flag.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('flag.block.header'),
      message: this.i18n.tUi('flag.block.messageBulk', { count: rows.length }),
      icon: 'pi pi-lock',
      accept: () => this.blockSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('flag.deactivate.header'),
      message: this.i18n.tUi('flag.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.flagFacade.activateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('flag.activate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.flagFacade.blockBulk(rows.map((row) => row.id)),
      this.i18n.tUi('flag.block.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.flagFacade.deactivateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('flag.deactivate.successBulk', { count: rows.length }),
    );
  }

  statusLabel(status: StatusEnum | null) {
    return statusEnumLabel(status, this.i18n);
  }

  statusSeverity(status: StatusEnum | null) {
    return statusEnumSeverity(status);
  }

  clear() {
    this.clearTableAndReload();
  }

  readonly canRegisterNew = computed(() => {
    return this.secPolicy.canCreate();
  });

  readonly canDeactivateSelected = computed(() => {
    const status = this.selectionStatus();
    return status === StatusEnum.ACTIVE && this.secPolicy.canDeactivateBulk(this.selectedRows());
  });

  readonly canActivateSelected = computed(() => {
    const status = this.selectionStatus();
    return (
      (status === StatusEnum.INACTIVE || status === StatusEnum.BLOCKED) &&
      this.secPolicy.canActivateBulk(this.selectedRows())
    );
  });

  readonly canBlockSelected = computed(() => {
    const status = this.selectionStatus();
    return status === StatusEnum.ACTIVE && this.secPolicy.canBlockBulk(this.selectedRows());
  });

  readonly selectionStatus = computed<StatusEnum | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy.selectableStatus(selected[0]);
  });

  readonly selectionModeLabel = computed(() => {
    const status = this.selectionStatus();
    if (status === StatusEnum.ACTIVE) return this.i18n.tUi('enum.statusEnum.active');
    if (status === StatusEnum.INACTIVE) return this.i18n.tUi('enum.statusEnum.inactive');
    if (status === StatusEnum.BLOCKED) return this.i18n.tUi('enum.statusEnum.blocked');
    return this.i18n.tUi('flag.selection.mode.none');
  });

  protected override onAfterClear(): void {
    this.clearSelection();
    this.expandedFlagId.set(null);
    this.expandedRelationType.set(null);
  }

  protected override clearCustomTableState(defaultRows: number): void {
    this.flagTable?.clearTableFilters(defaultRows);
  }

  protected loadFirstPage(): void {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<FlagAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.clearSelection();
    this.flagFacade.loadPage(query);
  }

  protected buildAdvancedFilters(): FlagAdvancedFilters {
    return {
      name: this.name()?.trim() || null,
      erpCode: this.erpCode() || null,
      statusEnum: this.statusEnum(),
    };
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override tableStateKey(): string {
    return 'cardsync.flag.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'flag.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.flag.filters.v1';
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const name = this.name()?.trim();
    const erpCode = this.erpCode();
    const statusEnum = this.statusEnum();

    if (name) {
      items.push({
        label: this.i18n.tUi('flag.fields.name'),
        value: name,
      });
    }

    if (erpCode != null) {
      items.push({
        label: this.i18n.tUi('flag.fields.erpCode'),
        value: String(erpCode),
      });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('flag.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const name = readSingleFilterValue(filters, 'name');
    const erpCode = readSingleFilterValue(filters, 'erpCode');
    const statusEnum = readArrayFilterValues(filters, 'statusEnum');

    if (erpCode) {
      items.push({
        label: this.i18n.tUi('flag.columns.erpCode'),
        value: String(erpCode),
      });
    }

    if (name) {
      items.push({
        label: this.i18n.tUi('flag.columns.name'),
        value: String(name),
      });
    }

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('flag.columns.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(query: ReturnType<typeof buildListQuery<FlagAdvancedFilters>>): void {
    this.clearSelection();
    this.flagFacade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.name.set('');
    this.erpCode.set(null);
    this.statusEnum.set(null);
  }

  protected override toFiltersState(): FlagFiltersState {
    return {
      name: this.name(),
      erpCode: this.erpCode(),
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
    };
  }

  protected override applyFiltersState(s: FlagFiltersState): void {
    this.name.set(s.name ?? '');
    this.erpCode.set(s.erpCode ?? null);
    this.statusEnum.set(s.statusEnum ?? null);
  }
}
