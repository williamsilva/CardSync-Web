import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelect } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagTone, CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { BankFacade } from '@features/facade/bank.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { SaleSummaryFacade } from '@features/facade/sales-summary.facade';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { AdjustmentTableComponent } from './adjustments-table/adjustments-table.component';
import { CreditOrdersTableComponent } from './credit-orders-table/credit-orders-table.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  SaleSummaryFiltersState,
  SaleSummaryAdvancedFilters,
  createEmptySaleSummaryFiltersState,
} from '@features/filter/sale-summary.filters';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  StatusTransactionEnum,
  allStatusTransactionEnum,
  statusTransactionEnumLabel,
  statusTransactionEnumSeverity,
} from '@models/enums/status-transaction.enum';
import {
  StatusPaymentBankEnum,
  allStatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
  statusPaymentBankEnumSeverity,
} from '@models/enums/status-payment-bank.enum';
import {
  SaleSummaryModel,
  resetSaleSummaryAdvancedFilters,
  createEmptySaleSummaryAdvancedFilters,
} from '@models/sales-summary.model';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  StatusReconciliationEnum,
  allStatusReconciliationEnum,
  statusReconciliationEnumLabel,
  statusReconciliationEnumSeverity,
} from '@models/enums/status-reconciliation.enum';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-sale-summary-list',
  templateUrl: './sale-summary.component.html',
  imports: [
    CommonModule,
    Menu,
    Select,
    Tooltip,
    CsDatePipe,
    FloatLabel,
    DatePicker,
    TableModule,
    MultiSelect,
    FormsModule,
    ButtonModule,
    CsCurrencyPipe,
    CsDocumentPipe,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    AdjustmentTableComponent,
    CreditOrdersTableComponent,
    CsColumnFilterShellComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class SaleSummaryListComponent
  extends StatefulListPage<SaleSummaryFiltersState, SaleSummaryAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(SaleSummaryFacade);

  readonly router = inject(Router);
  readonly flagFacade = inject(FlagFacade);
  readonly bankFacade = inject(BankFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  readonly flagsOptions = this.flagFacade.options;
  readonly banksOptions = this.bankFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly sales = computed<SaleSummaryModel[]>(() => this.facade.sales());

  readonly expandedRowId = signal<string | null>(null);
  readonly expandedTableType = signal<'orders' | 'adjustments' | null>(null);

  readonly isRvDateColumnDisabled = computed(() => !this.rvDateColumnPeriod());
  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  /* Campos Filtros avançados */
  readonly periodRvDate = signal<PeriodEnum | null>(null);
  readonly rvDate = signal<string | string[] | null>(null);

  readonly rvNumber = signal('');

  readonly flags = signal<string[] | null>(null);
  readonly banks = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);
  readonly transactionsStatus = signal<StatusTransactionEnum[] | null>(null);
  readonly creditOrderStatus = signal<StatusReconciliationEnum[] | null>(null);

  readonly isRvDateDisabled = computed(() => !this.periodRvDate());

  /* Campos Tabela */
  readonly rvNumberColumnDraft = signal('');
  readonly pvNumberColumnDraft = signal('');
  readonly grossValueColumnDraft = signal('');
  readonly numberCvNsuColumnDraft = signal('');
  readonly liquidValueColumnDraft = signal('');
  readonly discountValueColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly rvDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly modalityColumnDraft = signal<ModalityEnum[] | null>(null);
  readonly rvDateColumnDraft = signal<string | string[] | null>(null);
  readonly statusPaymentBankColumnDraft = signal<StatusPaymentBankEnum[] | null>(null);
  readonly transactionsStatusColumnDraft = signal<StatusTransactionEnum[] | null>(null);
  readonly creditOrderStatusColumnDraft = signal<StatusReconciliationEnum[] | null>(null);

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly transactionsStatusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusTransactionEnum().map((value) => ({
      label: statusTransactionEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusPaymentBankOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusPaymentBankEnum().map((value) => ({
      label: statusPaymentBankEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusReconciliationOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusReconciliationEnum().map((value) => ({
      label: statusReconciliationEnumLabel(value, this.i18n),
      value,
    }));
  });

  ngOnInit(): void {
    this.bankFacade.loadBankOptionsFilter();
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();

    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.syncColumnDraftsFromTableState();
    });
  }

  clear(): void {
    const key = this.tableStateKey();

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();
    this.rvNumberColumnDraft.set('');
    this.pvNumberColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.liquidValueColumnDraft.set('');
    this.numberCvNsuColumnDraft.set('');
    this.discountValueColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.rvDateColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.rvDateColumnPeriod.set(null);
    this.modalityColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.creditOrderStatusColumnDraft.set(null);
    this.statusPaymentBankColumnDraft.set(null);
    this.transactionsStatusColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusTransactionLabel(value: StatusTransactionEnum | null): string {
    return statusTransactionEnumLabel(value, this.i18n);
  }

  statusTransactionSeverity(value: StatusTransactionEnum | null): CsTagTone {
    return statusTransactionEnumSeverity(value);
  }

  statusReconciliationLabel(value: StatusReconciliationEnum | null): string {
    return statusReconciliationEnumLabel(value, this.i18n);
  }

  statusReconciliationSeverity(value: StatusReconciliationEnum | null): CsTagTone {
    return statusReconciliationEnumSeverity(value);
  }

  statusPaymentBankEnumLabel(value: StatusPaymentBankEnum | null): string {
    return statusPaymentBankEnumLabel(value, this.i18n);
  }

  statusPaymentBankSeverity(value: StatusPaymentBankEnum | null): CsTagTone {
    return statusPaymentBankEnumSeverity(value);
  }

  modalityLabel(value: ModalityEnum | null): string {
    return modalityEnumLabel(value, this.i18n);
  }

  modalitySeverity(value: ModalityEnum | null): CsTagTone {
    return modalityEnumSeverity(value);
  }

  toggleAdjustments(row: SaleSummaryModel) {
    if (this.expandedRowId() === row.id && this.expandedTableType() === 'adjustments') {
      this.expandedRowId.set(null);
      this.expandedTableType.set(null);
      return;
    }

    this.expandedRowId.set(row.id);
    this.expandedTableType.set('adjustments');
  }

  toggleCreditOrders(row: SaleSummaryModel) {
    if (this.expandedRowId() === row.id && this.expandedTableType() === 'orders') {
      this.expandedRowId.set(null);
      this.expandedTableType.set(null);
      return;
    }

    this.expandedRowId.set(row.id);
    this.expandedTableType.set('orders');
  }

  protected emptyFiltersState(): SaleSummaryAdvancedFilters {
    return createEmptySaleSummaryAdvancedFilters();
  }

  protected override onAfterClear(): void {
    this.expandedRowId.set(null);
    this.expandedTableType.set(null);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.SALES_SUMMARY.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.SALES_SUMMARY.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.SALES_SUMMARY.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<SaleSummaryAdvancedFilters>>,
  ): void {
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<SaleSummaryAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetSaleSummaryAdvancedFilters(this);
  }

  /* Filtros Avançados */
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const rvDate = this.rvDate();
    const periodRvDate = this.periodRvDate();
    const rvDateValue = this.formatActiveFilterPeriodDateValue(periodRvDate, rvDate, this.i18n);
    if (rvDateValue) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.rvDate'),
        value: rvDateValue,
      });
    }

    const rvNumber = this.rvNumber();
    if (rvNumber) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.rvNumber'),
        value: rvNumber,
      });
    }

    const acquirer = this.acquirers();
    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('saleSummary.fields.acquirer'),
        value: labels,
      });
    }

    const flag = this.flags();
    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('saleSummary.fields.flag'),
        value: labels,
      });
    }

    const bank = this.banks();
    if (bank?.length) {
      const labels = this.banksOptions()
        .filter((opt) => bank.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('saleSummary.fields.bank'),
        value: labels,
      });
    }

    const company = this.companies();
    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('saleSummary.fields.company'),
        value: labels,
      });
    }

    const establishment = this.establishments();
    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.pvNumber))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('saleSummary.fields.establishment'),
        value: labels,
      });
    }

    const modality = this.modality();
    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const transactionsStatus = this.transactionsStatus();
    if (transactionsStatus?.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.transactionsStatusEnum'),
        value: transactionsStatus.map((v) => statusTransactionEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const creditOrderStatus = this.creditOrderStatus();
    if (creditOrderStatus?.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.creditOrderStatusEnum'),
        value: creditOrderStatus.map((v) => statusReconciliationEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const statusPaymentBank = this.statusPaymentBank();
    if (statusPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.statusPaymentBankEnum'),
        value: statusPaymentBank.map((v) => statusPaymentBankEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  protected override buildAdvancedFilters(): Partial<SaleSummaryAdvancedFilters> {
    return {
      rvDate: this.rvDate() ?? undefined,
      periodRvDate: this.periodRvDate() ?? undefined,

      rvNumber: this.rvNumber() ?? undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      banks: this.banks()?.length ? this.banks()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      modality: this.modality()?.length ? this.modality()! : undefined,
      transactionsStatus: this.transactionsStatus()?.length
        ? this.transactionsStatus()!
        : undefined,
      creditOrderStatus: this.creditOrderStatus()?.length ? this.creditOrderStatus()! : undefined,
      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,
    };
  }

  /* End Filtros Avançados */
  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

    this.syncTextColumnDraftFromTableState(
      filters,
      'rvNumber',
      this.rvNumberColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'numberCvNsu',
      this.numberCvNsuColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'discountValue',
      this.discountValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'liquidValue',
      this.liquidValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'grossValue',
      this.grossValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'modality',
      this.modalityColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'transactionsStatus',
      this.transactionsStatusColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'statusPaymentBank',
      this.statusPaymentBankColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'creditOrderStatus',
      this.creditOrderStatusColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'pvNumber',
      this.pvNumberColumnDraft,
      readSingleFilterValue,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'company',
      this.companyColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'acquirer',
      this.acquirerColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'flag',
      this.flagColumnDraft,
      readArrayFilterValues,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'rvDate',
      this.rvDateColumnPeriod,
      this.rvDateColumnDraft,
      readPeriodFilterValue,
    );
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((option) => flags.includes(option.id))
        .map((option) => option.name);

      items.push({
        label: this.i18n.tUi('saleSummary.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('saleSummary.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('saleSummary.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);

      items.push({
        label: this.i18n.tUi('saleSummary.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.modality'),
        value: modalities.map((v) => modalityEnumLabel(v as ModalityEnum, this.i18n)).join(', '),
      });
    }

    const transactionsStatuses = readArrayFilterValues(filters, 'transactionsStatus');
    if (transactionsStatuses.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.transactionsStatusEnum'),
        value: transactionsStatuses
          .map((v) => statusTransactionEnumLabel(v as StatusTransactionEnum, this.i18n))
          .join(', '),
      });
    }

    const creditOrderStatuses = readArrayFilterValues(filters, 'creditOrderStatus');
    if (creditOrderStatuses.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.creditOrderStatusEnum'),
        value: creditOrderStatuses
          .map((v) => statusReconciliationEnumLabel(v as StatusReconciliationEnum, this.i18n))
          .join(', '),
      });
    }

    const statusPaymentBanks = readArrayFilterValues(filters, 'statusPaymentBank');
    if (statusPaymentBanks.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.statusPaymentBankEnum'),
        value: statusPaymentBanks
          .map((v) => statusPaymentBankEnumLabel(v as StatusPaymentBankEnum, this.i18n))
          .join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): SaleSummaryFiltersState {
    return {
      rvDate: this.rvDate(),
      periodRvDate: this.periodRvDate(),
      rvNumber: this.rvNumber(),

      flags: this.flags(),
      banks: this.banks(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      modality: this.modality(),
      transactionsStatus: this.transactionsStatus(),
      creditOrderStatus: this.creditOrderStatus(),
      statusPaymentBank: this.statusPaymentBank(),
    };
  }

  protected override applyFiltersState(s: SaleSummaryAdvancedFilters): void {
    this.rvDate.set(s.rvDate ?? null);
    this.periodRvDate.set(s.periodRvDate ?? null);

    this.flags.set(s.flags ?? null);
    this.banks.set(s.banks ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.modality.set(s.modality ?? null);
    this.transactionsStatus.set(s.transactionsStatus ?? null);
    this.creditOrderStatus.set(s.creditOrderStatus ?? null);
    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
  }

  /* Metodos busca */
  protected searchActions(row: SaleSummaryModel): MenuItem[] {
    return [
      {
        label: `${this.i18n.tUi('common.search.process')}: ${row.processedFile?.file}
            (${this.i18n.tUi('common.search.line')}: ${row.lineNumber})`,
        icon: 'pi pi-eye',
        command: () => this.searchOnFileSales(row),
      },
      {
        label: this.i18n.tUi('common.search.transactions'),
        icon: 'pi pi-search',
        command: () => this.searchOnTransactions(row),
      },
    ];
  }

  protected searchOnFileSales(row: SaleSummaryModel): void {
    const targetFilters = this.buildTargetFileFilters(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/file-processing/files']);
  }

  protected buildTargetFileFilters(_row: SaleSummaryModel): SaleSummaryAdvancedFilters {
    return {
      ...this.emptyFiltersState(),
    };
  }

  protected searchOnTransactions(row: SaleSummaryModel): void {
    const targetFilters = this.buildTargetSalesSummary(row);

    localStorage.setItem(STATE_KEY.CARDSYNC.ACQ.SALES.FILTERS.V1, JSON.stringify(targetFilters));
    localStorage.removeItem(STATE_KEY.CARDSYNC.ACQ.SALES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/sales']);
  }

  protected buildTargetSalesSummary(row: SaleSummaryModel): SaleSummaryAdvancedFilters {
    return {
      ...createEmptySaleSummaryFiltersState(),
      rvDate: row.rvDate ? String(row.rvDate) : undefined,

      rvNumber: row.rvNumber ? row.rvNumber : '',

      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
    };
  }

  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
