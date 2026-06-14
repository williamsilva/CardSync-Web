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
import { MultiSelect } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent, CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { BankFacade } from '@features/facade/bank.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { BankingDomicileModel } from '@models/banking-domicile.models';
import { STATE_KEY } from '@features/state-key.constants';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { BankingDomicileFacade } from '@features/facade/banking-domicile.facade';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { DATA_TABLE_SHELL_IMPORTS } from '@shared/features/data-table-shell/data-table-shell.component';
import { BankingDomicilePermissionPolicy } from '@features/security/policy/banking-domicile-permission.policy';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { BankingDomicileCreateDialogComponent } from '../banking-domicile-create/banking-domicile-create-dialog.component';
import {
  readArrayFilterValues,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  BankingDomicileFiltersState,
  BankingDomicileAdvancedFilters,
  resetBankingDomicileAdvancedFilters,
} from '@features/filter/banking-domicile.filters';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';

@Component({
  standalone: true,
  selector: 'app-banking-domicile-list',
  templateUrl: './banking-domicile-list.component.html',
  imports: [
    CommonModule,
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    PanelModule,
    MultiSelect,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CsDocumentPipe,
    CheckboxModule,
    SkeletonModule,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    ConfirmDialogModule,
    FiltersPanelComponent,
    DATA_TABLE_SHELL_IMPORTS,
    CsColumnFilterShellComponent,
    BankingDomicileCreateDialogComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class BankingDomicileListComponent extends StatefulListPage<
  BankingDomicileFiltersState,
  BankingDomicileAdvancedFilters
> {
  @ViewChild('dt') private dt?: Table;

  protected readonly toast = inject(MessageService);
  protected override readonly i18n = inject(I18nService);
  protected readonly confirm = inject(ConfirmationService);

  readonly bankFacade = inject(BankFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly facade = inject(BankingDomicileFacade);
  protected readonly secPolicy = inject(BankingDomicilePermissionPolicy);

  readonly banksOptions = this.bankFacade.options;
  readonly companiesOptions = this.companyFacade.options;

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  private readonly bulk = new (class extends BulkActionListPage {
    protected override readonly i18n = inject(I18nService);
    protected override readonly toast = inject(MessageService);
    protected override readonly confirm = inject(ConfirmationService);

    constructor(private readonly host: BankingDomicileListComponent) {
      super();
    }

    protected override clearSelection(): void {
      this.host.clearSelection();
    }
  })(this);

  skeletonRows = Array.from({ length: 9 });

  /* Campos Avançados*/
  readonly banks = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);

  /* Campos Tabela*/
  agencyColumnDraft = signal<string>('');
  currentAccountColumnDraft = signal<string>('');
  bankColumnDraft = signal<string[] | null>(null);
  companyColumnDraft = signal<string[] | null>(null);

  status = signal<boolean | null>(null);

  upsertVisible = signal(false);
  selectedRows = signal<BankingDomicileModel[]>([]);
  bankingDomicile = signal<BankingDomicileModel | null>(null);

  totalRecords = computed(() => this.facade.totalRecords());
  bankingDomiciles = computed<BankingDomicileModel[]>(() => this.facade.bankingDomiciles());

  readonly statusFilterOptions = computed(() => {
    this.i18n.getAppliedLang();
    return [
      { label: this.i18n.tUi('enum.statusEnum.active'), value: true },
      { label: this.i18n.tUi('enum.statusEnum.inactive'), value: false },
    ];
  });

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const bank = this.banks();
    const status = this.status();
    const company = this.companies();

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('bankingDomicile.fields.company'),
        value: labels,
      });
    }

    if (bank?.length) {
      const labels = this.banksOptions()
        .filter((opt) => bank.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('bankingDomicile.fields.bank'),
        value: labels,
      });
    }

    if (status !== null) {
      items.push({
        label: this.i18n.tUi('bankingDomicile.fields.status'),
        value: status
          ? this.i18n.tUi('enum.statusEnum.active')
          : this.i18n.tUi('enum.statusEnum.inactive'),
      });
    }

    return items;
  });

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;

    if (!filters) {
      return;
    }

    this.syncArrayColumnDraftFromTableState(
      filters,
      'bak',
      this.bankColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'company',
      this.companyColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'bank',
      this.bankColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'agency',
      this.agencyColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'currentAccount',
      this.currentAccountColumnDraft,
      readSingleFilterValue,
    );
  }

  selectionActive = computed<boolean | null>(() => {
    const selected = this.selectedRows();
    if (!selected.length) return null;
    return this.secPolicy.selectableActive(selected[0]);
  });

  hasSelectionMode = computed(() => this.selectionActive() !== null);

  headerEligibleRows = computed(() => {
    const selectedActive = this.selectionActive();
    if (selectedActive === null) return [];
    return this.bankingDomiciles().filter((row) =>
      this.secPolicy.canSelectForActive(row, selectedActive),
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
    const status = this.selectionActive();
    return status === false && this.secPolicy.canActivateBulk(this.selectedRows());
  });

  canDeactivateSelected = computed(() => {
    const status = this.selectionActive();
    return status === true && this.secPolicy.canDeactivateBulk(this.selectedRows());
  });

  selectionModeLabel = computed(() => {
    const status = this.selectionActive();
    if (status === true) return this.i18n.tUi('enum.statusEnum.active');
    if (status === false) return this.i18n.tUi('enum.statusEnum.inactive');
    return this.i18n.tUi('bankingDomicile.selection.mode.none');
  });

  ngOnInit() {
    this.initStatefulList();
    this.bankFacade.loadBankOptionsFilter();
  }

  clear() {
    const key = this.tableStateKey();

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();

    this.agencyColumnDraft.set('');
    this.currentAccountColumnDraft.set('');

    this.companyColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  onSaved(): void {
    this.refresh();
  }

  isRowCheckboxDisabled(row: BankingDomicileModel): boolean {
    if (this.isRowSelected(row)) return false;
    return !this.secPolicy.canSelectForActive(row, this.selectionActive());
  }

  isRowSelected(row: BankingDomicileModel): boolean {
    return this.selectedRows().some((item) => item.id === row.id);
  }

  toggleRowSelection(row: BankingDomicileModel, checked: boolean): void {
    const current = this.selectedRows();
    if (!checked) {
      this.selectedRows.set(current.filter((item) => item.id !== row.id));
      return;
    }
    const rowActive = this.secPolicy.selectableActive(row);
    if (rowActive === null) return;
    if (!current.length) {
      this.selectedRows.set([row]);
      return;
    }
    if (rowActive !== this.selectionActive()) return;
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

  activate(row: BankingDomicileModel): void {
    this.bulk.executeAction(
      this.facade.activate(row.id),
      this.i18n.tUi('bankingDomicile.activate.successSingle'),
    );
  }

  deactivate(row: BankingDomicileModel): void {
    this.bulk.executeAction(
      this.facade.deactivate(row.id),
      this.i18n.tUi('bankingDomicile.deactivate.successSingle'),
    );
  }

  confirmActivate(row: BankingDomicileModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('bankingDomicile.activate.header'),
      message: this.i18n.tUi('bankingDomicile.activate.messageSingle', {
        name: `${row.agency} / ${row.currentAccount}-${row.accountDigit}`,
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.activate(row),
    });
  }

  confirmDeactivate(row: BankingDomicileModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('bankingDomicile.deactivate.header'),
      message: this.i18n.tUi('bankingDomicile.deactivate.messageSingle', {
        name: `${row.agency} / ${row.currentAccount}-${row.accountDigit}`,
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivate(row),
    });
  }

  activateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.activateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('bankingDomicile.activate.successBulk', { count: rows.length }),
    );
  }

  deactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.executeAction(
      this.facade.deactivateBulk(rows.map((r) => r.id)),
      this.i18n.tUi('bankingDomicile.deactivate.successBulk', { count: rows.length }),
    );
  }

  confirmActivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('bankingDomicile.activate.header'),
      message: this.i18n.tUi('bankingDomicile.activate.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.activateSelected(),
    });
  }

  confirmDeactivateSelected(): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    this.bulk.confirmAction({
      header: this.i18n.tUi('bankingDomicile.deactivate.header'),
      message: this.i18n.tUi('bankingDomicile.deactivate.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deactivateSelected(),
    });
  }

  statusEnumLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
  }

  goNew() {
    if (!this.secPolicy.canCreate()) return;
    this.bankingDomicile.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: BankingDomicileModel) {
    if (!this.secPolicy.canEdit(row)) return;
    this.bankingDomicile.set(row);
    this.upsertVisible.set(true);
  }

  onUpsertVisibleChange(v: boolean) {
    this.upsertVisible.set(v);
    if (!v) this.bankingDomicile.set(null);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.BANKING_DOMICILE.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.BANKING_DOMICILE.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.REGISTER.BANKING_DOMICILE.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected loadFirstPage() {
    const query = buildListQuery<BankingDomicileAdvancedFilters>(
      { page: 0, size: this.rows } as any,
      this.buildAdvancedFilters(),
    );
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected override resetFilters(): void {
    resetBankingDomicileAdvancedFilters(this);
  }

  protected override toFiltersState(): BankingDomicileFiltersState {
    return {
      banks: this.banks(),
      companies: this.companies(),
    };
  }

  protected override applyFiltersState(s: BankingDomicileFiltersState): void {
    this.banks.set(s.banks ?? null);
    this.companies.set(s.companies ?? null);
  }

  protected override buildAdvancedFilters(): Partial<BankingDomicileAdvancedFilters> {
    return {
      banks: this.banks()?.length ? this.banks()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('bankingDomicile.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const banks = readArrayFilterValues(filters, 'bank');
    if (banks.length) {
      const labels = this.banksOptions()
        .filter((option) => banks.includes(option.id))
        .map((option) => option.name);

      items.push({
        label: this.i18n.tUi('bankingDomicile.fields.bank'),
        value: (labels.length ? labels : banks).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<BankingDomicileAdvancedFilters>>,
  ): void {
    this.clearSelection();
    this.facade.loadPage(query);
  }

  protected clearSelection(): void {
    this.selectedRows.set([]);
  }
}
