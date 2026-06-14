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
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { BankFacade } from '@features/facade/bank.facade';
import { BankAdvancedFilters } from '@features/filter/bank.filters';
import { STATE_KEY } from '@features/state-key.constants';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { BankModel, BankFiltersState } from '@models/bank.models';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { BankPermissionPolicy } from '@features/security/policy/bank-permission.policy';
import { BankCreateDialogComponent } from '../bank-create/bank-create-dialog.component';
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
} from '@features/list-base/table-filter-readers';

@Component({
  standalone: true,
  selector: 'app-bank-list',
  templateUrl: './bank-list.component.html',
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
    MultiSelectModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    DATA_TABLE_SHELL_IMPORTS,
    BankCreateDialogComponent,
  ],
})
export class BankListComponent extends StatefulListPage<BankFiltersState, BankAdvancedFilters> {
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly facade = inject(BankFacade);
  protected readonly secPolicy = inject(BankPermissionPolicy);
  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: BankListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 8 });

  code = signal('');
  name = signal('');
  statusEnum = signal<StatusEnum[] | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<BankModel[]>([]);
  bank = signal<BankModel | null>(null);

  totalRecords = computed(() => this.facade.totalRecords());
  banks = computed<BankModel[]>(() => this.facade.banks());

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusEnum().map((value) => ({
      label: statusEnumLabel(value, this.i18n),
      value,
    }));
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const code = this.code().trim();
    const name = this.name().trim();
    const statusEnum = this.statusEnum();

    if (code) items.push({ label: this.i18n.tUi('bank.fields.code'), value: code });
    if (name) items.push({ label: this.i18n.tUi('bank.fields.name'), value: name });

    if (statusEnum?.length) {
      items.push({
        label: this.i18n.tUi('bank.fields.statusEnum'),
        value: statusEnum.map((v) => statusEnumLabel(v, this.i18n)).join(', '),
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
    return this.banks().filter((row) => this.secPolicy.canSelectForStatus(row, selectedStatus));
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
    return this.i18n.tUi('bank.selection.mode.none');
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

  isRowCheckboxDisabled(row: BankModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForStatus(row, this.selectionStatus());
  }

  isRowSelected(row: BankModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: BankModel, checked: boolean): void {
    const current = this.selectedRows();
    if (!checked) { this.selectedRows.set(current.filter((item) => item.id !== row.id)); return; }
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

  activate(row: BankModel): void {
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('bank.activate.successSingle'),
    );
  }

  deactivate(row: BankModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('bank.deactivate.successSingle'),
    );
  }

  block(row: BankModel): void {
    this.bulk.executeAction(
      this.facade.block(row.id),
      this.i18n.tUi('bank.block.successSingle'),
    );
  }

  confirmActivate(row: BankModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('bank.activate.header'),
      message: this.i18n.tUi('bank.activate.messageSingle', { name: row.name }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: BankModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('bank.deactivate.header'),
      message: this.i18n.tUi('bank.deactivate.messageSingle', { name: row.name }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  confirmBlock(row: BankModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('bank.block.header'),
      message: this.i18n.tUi('bank.block.messageSingle', { name: row.name }),
      icon: 'pi pi-lock',
      accept: () => this.block(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.activateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('bank.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('bank.deactivate.successBulk', { count: rows.length }),
    );
  }

  blockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.blockBulk(rows.map((r) => r.id)),
      this.i18n.tUi('bank.block.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('bank.activate.header'),
      message: this.i18n.tUi('bank.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('bank.deactivate.header'),
      message: this.i18n.tUi('bank.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  confirmBlockSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('bank.block.header'),
      message: this.i18n.tUi('bank.block.messageBulk', { count: rows.length }),
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
    this.bank.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: BankModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.bank.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.bank.set(null);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.BANKS.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.BANKS.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.BANKS.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const query = buildListQuery<BankAdvancedFilters>(
      { page: 0, size: this.rows } as any,
      this.buildAdvancedFilters(),
    );
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.code.set('');
    this.name.set('');
    this.statusEnum.set(null);
  }

  protected override toFiltersState(): BankFiltersState {
    return {
      code: this.code(),
      name: this.name(),
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : null,
    };
  }

  protected override applyFiltersState(s: BankFiltersState): void {
    this.code.set(s.code ?? '');
    this.name.set(s.name ?? '');
    this.statusEnum.set(s.statusEnum ?? null);
  }

  protected override buildAdvancedFilters(): Partial<BankAdvancedFilters> {
    return {
      code: this.code().trim() || undefined,
      name: this.name().trim() || undefined,
      statusEnum: this.statusEnum()?.length ? this.statusEnum() : undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const code = readSingleFilterValue(filters, 'code');
    if (code) items.push({ label: this.i18n.tUi('bank.fields.code'), value: code });

    const name = readSingleFilterValue(filters, 'name');
    if (name) items.push({ label: this.i18n.tUi('bank.fields.name'), value: name });

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('bank.fields.statusEnum'),
        value: statuses.map((v) => statusEnumLabel(v as StatusEnum, this.i18n)).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<BankAdvancedFilters>>,
  ): void {
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }
}
