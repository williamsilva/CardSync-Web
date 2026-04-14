import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService, MessageService } from 'primeng/api';

import { I18nService } from '@core/i18n/i18n.service';
import { ContractFacade } from '@features/facade/contract.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { ContractAdvancedFilters } from '@features/filter/contract.filters';
import { ContractFiltersState, ContractModel } from '@models/contract.models';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ContractPermissionPolicy } from '@features/security/policy/contract-permission.policy';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  readArrayFilterValues,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  StatusEnum,
  allStatusEnum,
  statusEnumLabel,
  statusEnumSeverity,
} from '@models/enums/status.enum';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.html',
  imports: [
    CommonModule,
    TagModule,
    FloatLabel,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CheckboxModule,
    InputTextModule,
    TranslateModule,
    MultiSelectModule,
    PageHeaderComponent,
    FiltersPanelComponent,
  ],
})
export class ContractListComponent extends StatefulListPage<
  ContractFiltersState,
  ContractAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  readonly facade = inject(ContractFacade);

  protected readonly toast = inject(MessageService);
  protected override readonly i18n = inject(I18nService);
  protected readonly confirm = inject(ConfirmationService);
  protected readonly secPolicy = inject(ContractPermissionPolicy);

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: ContractListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 8 });
  override rows = Number(localStorage.getItem('contract.table.rows')) || 10;

  name = signal('');

  statusEnum = signal<StatusEnum[] | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<ContractModel[]>([]);
  contract = signal<ContractModel | null>(null);
  totalRecords = computed(() => this.facade.totalRecords());
  contracts = computed<ContractModel[]>(() => this.facade.contract() as ContractModel[]);

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

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
    return this.contracts().filter((row) => this.secPolicy.canSelectForStatus(row, selectedStatus));
  });

  headerChecked = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;
    return eligible.every((row) => this.isRowSelected(row));
  });

  headerIndeterminate = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;

    const selectedCount = eligible.filter((row) => this.isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < eligible.length;
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
    return this.i18n.tUi('contract.selection.mode.none');
  });

  ngOnInit() {
    this.initStatefulList();
  }

  clear() {
    this.clearSelection();
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: ContractModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
  }

  isRowSelected(row: ContractModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: ContractModel, checked: boolean): void {
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

  activate(row: ContractModel): void {
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('contract.activate.successSingle'),
    );
  }

  deactivate(row: ContractModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('contract.deactivate.successSingle'),
    );
  }

  block(row: ContractModel): void {
    this.bulk.executeAction(
      this.facade.block(row.id),
      this.i18n.tUi('contract.block.successSingle'),
    );
  }

  confirmActivate(row: ContractModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.activate.header'),
      message: this.i18n.tUi('contract.activate.messageSingle', {
        name: row?.name ?? row?.name ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: ContractModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.deactivate.header'),
      message: this.i18n.tUi('contract.deactivate.messageSingle', {
        name: row?.name ?? row?.name ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: ContractModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.block.header'),
      message: this.i18n.tUi('contract.block.messageSingle', {
        name: row?.name ?? row?.name ?? row?.id ?? '',
      }),
      icon: 'pi pi-lock',
      accept: () => this.block(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.activateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('contract.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((row) => row.id)),
      this.i18n.tUi('contract.deactivate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.executeAction(
      this.facade.blockBulk(rows.map((row) => row.id)),
      this.i18n.tUi('contract.block.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.activate.header'),
      message: this.i18n.tUi('contract.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.deactivate.header'),
      message: this.i18n.tUi('contract.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;

    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.block.header'),
      message: this.i18n.tUi('contract.block.messageBulk', { count: rows.length }),
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
    this.contract.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: ContractModel) {
    this.contract.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.contract.set(null);
  }

  onCreated() {
    this.reloadWithCurrentState();
  }

  protected override tableStateKey(): string {
    return 'cardsync.contract.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'contract.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.contract.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<ContractAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.name.set('');

    this.statusEnum.set(null);
  }

  protected override toFiltersState(): ContractFiltersState {
    return {
      name: this.name(),
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
    };
  }

  protected override applyFiltersState(s: ContractFiltersState): void {
    this.name.set(s.name ?? '');

    this.statusEnum.set(s.statusEnum ?? null);
  }

  protected override buildAdvancedFilters(): Partial<ContractAdvancedFilters> {
    return {
      name: this.name().trim() || undefined,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const name = readSingleFilterValue(filters, 'name');
    if (name) {
      items.push({ label: this.i18n.tUi('contract.fields.name'), value: name });
    }

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('contract.fields.statusEnum'),
        value: statuses.map((value) => statusEnumLabel(value as StatusEnum, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<ContractAdvancedFilters>>,
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
