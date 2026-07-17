import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Menu } from 'primeng/menu';
import { Table } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelect } from 'primeng/multiselect';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { FlagFacade } from '@features/facade/flag.facade';
import { STATE_KEY } from '@features/state-key.constants';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
import { allModalityEnum, modalityEnumLabel } from '../../../models/enums/modality.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { TransactionsAcqInstallmentModel } from '@models/transactions-acq-installment.models';
import { statusTransactionReasonEnumLabel } from '@models/enums/status-transaction-reason.enum';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { TransactionsAcqInstallmentFacade } from '@features/facade/transaction-acq-installment.facade';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  CaptureEnum,
  allCaptureEnum,
  captureEnumLabel,
  captureEnumSeverity,
} from '@models/enums/capture.enum';
import {
  ModalityEnum,
  modalityEnumSeverity,
  normalizeModalityEnum,
} from '@models/enums/modality.enum';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  StatusTransactionEnum,
  allStatusTransactionEnum,
  statusTransactionEnumLabel,
  installmentStatusTooltipTone,
  installmentTooltipStatusLabel,
  statusTransactionEnumSeverity,
  normalizeStatusTransactionEnum,
} from '@models/enums/status-transaction.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
import {
  TransactionsAcqInstallmentFiltersState,
  TransactionsAcqInstallmentAdvancedFilters,
  resetTransactionsAcqInstallmentAdvancedFilters,
  createEmptyTransactionsAcqInstallmentFiltersState,
} from '@features/filter/transaction-acq-installment.filters';
import {
  ProcessedFileFiltersState,
  createEmptyProcessedFileFiltersState,
} from '@features/filter/processed-file.filters';
import {
  StatusPaymentBankEnum,
  allStatusPaymentBankEnum,
  statusPaymentBankEnumLabel,
} from '@models/enums/status-payment-bank.enum';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-transactions-acq-installments-list',
  templateUrl: './transactions-acq-installments-list.component.html',
  imports: [
    CommonModule,
    Menu,
    Select,
    DatePicker,
    CsDatePipe,
    FloatLabel,
    MultiSelect,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
    CsCurrencyPipe,
    CsDocumentPipe,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class AcqInstallmentsListComponent
  extends StatefulListPage<
    TransactionsAcqInstallmentFiltersState,
    TransactionsAcqInstallmentAdvancedFilters
  >
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  private readonly router = inject(Router);
  protected override readonly i18n = inject(I18nService);

  readonly csDatePipe = inject(CsDatePipe);
  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);
  readonly installmentFacade = inject(TransactionsAcqInstallmentFacade);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.installmentFacade.totalRecords());
  readonly installments = computed<TransactionsAcqInstallmentModel[]>(() =>
    this.installmentFacade.installments(),
  );

  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  /* Campos Avançados*/
  readonly tid = signal('');
  readonly cvNsu = signal('');
  readonly authorization = signal('');

  readonly grossValueEnd = signal<number | null>(null);
  readonly liquidValueEnd = signal<number | null>(null);
  readonly grossValueStart = signal<number | null>(null);
  readonly discountValueEnd = signal<number | null>(null);
  readonly liquidValueStart = signal<number | null>(null);
  readonly discountValueStart = signal<number | null>(null);
  readonly adjustmentValueEnd = signal<number | null>(null);
  readonly adjustmentValueStart = signal<number | null>(null);

  readonly flags = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly capture = signal<CaptureEnum[] | null>(null);
  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly establishments = signal<string[] | null>(null);
  readonly periodSaleDate = signal<PeriodEnum | null>(null);
  readonly saleDate = signal<string | string[] | null>(null);
  readonly periodPaymentDate = signal<PeriodEnum | null>(null);
  readonly paymentDate = signal<string | string[] | null>(null);
  readonly periodExpectedPaymentDate = signal<PeriodEnum | null>(null);
  readonly expectedPaymentDate = signal<string | string[] | null>(null);
  readonly statusPaymentBank = signal<StatusPaymentBankEnum[] | null>(null);
  readonly statusTransaction = signal<StatusTransactionEnum[] | null>(null);

  /* Campos Tabela*/
  cvNsuColumnDraft = signal('');
  grossValueColumnDraft = signal('');
  liquidValueColumnDraft = signal('');
  installmentColumnDraft = signal('');
  authorizationColumnDraft = signal('');
  discountValueColumnDraft = signal('');
  establishmentColumnDraft = signal('');
  adjustmentValueColumnDraft = signal('');

  flagColumnDraft = signal<string[] | null>(null);
  companyColumnDraft = signal<string[] | null>(null);
  captureColumnDraft = signal<string[] | null>(null);
  acquirerColumnDraft = signal<string[] | null>(null);
  modalityColumnDraft = signal<string[] | null>(null);
  saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  saleDateColumnDraft = signal<string | string[] | null>(null);
  expectedPaymentDateColumnPeriod = signal<PeriodEnum | null>(null);
  expectedPaymentDateColumnDraft = signal<string | string[] | null>(null);

  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isPaymentDateDisabled = computed(() => !this.periodPaymentDate());
  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());
  readonly isExpectedPaymentDateDisabled = computed(() => !this.periodExpectedPaymentDate());

  readonly grossValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.grossValueStart(),
    end: this.grossValueEnd(),
  }));

  readonly adjustmentValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.adjustmentValueStart(),
    end: this.adjustmentValueEnd(),
  }));

  readonly discountValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.discountValueStart(),
    end: this.discountValueEnd(),
  }));

  readonly liquidValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.liquidValueStart(),
    end: this.liquidValueEnd(),
  }));

  readonly isExpectedPaymentDateColumnDisabled = computed(
    () => !this.expectedPaymentDateColumnPeriod(),
  );

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly captureEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allCaptureEnum().map((value) => ({
      label: captureEnumLabel(value, this.i18n),
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

  readonly statusTransactionOptions = computed(() => {
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

  ngOnInit(): void {
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

    this.installmentFacade.clearTotals();

    this.resetFilters();

    this.flagColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.captureColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.modalityColumnDraft.set(null);

    this.cvNsuColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.liquidValueColumnDraft.set('');
    this.installmentColumnDraft.set('');
    this.establishmentColumnDraft.set('');
    this.authorizationColumnDraft.set('');
    this.discountValueColumnDraft.set('');
    this.adjustmentValueColumnDraft.set('');

    this.saleDateColumnDraft.set(null);
    this.saleDateColumnPeriod.set(null);

    this.expectedPaymentDateColumnDraft.set(null);
    this.expectedPaymentDateColumnPeriod.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusEnumLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
  }

  calculateTotals(): void {
    this.installmentFacade.calculateTotals();
  }

  captureEnumLabel(value: CaptureEnum | null): string {
    return captureEnumLabel(value, this.i18n);
  }

  captureEnumSeverity(value: CaptureEnum | null): CsTagTone {
    return captureEnumSeverity(value);
  }

  modalityLabel(value: ModalityEnum | null): string {
    return modalityEnumLabel(value, this.i18n);
  }

  modalitySeverity(value: ModalityEnum | null): CsTagTone {
    return modalityEnumSeverity(value);
  }

  statusTransactionLabel(value: StatusTransactionEnum | null): string {
    return statusTransactionEnumLabel(value, this.i18n);
  }

  statusTransactionSeverity(value: StatusTransactionEnum | null): CsTagTone {
    return statusTransactionEnumSeverity(value);
  }

  protected searchActions(row: TransactionsAcqInstallmentModel): MenuItem[] {
    return [
      {
        label: `${this.i18n.tUi('transactions.search.process')}: ${row.transaction?.processedFile?.file}
          (${this.i18n.tUi('transactions.search.line')}: ${row.transaction?.lineNumber})`,
        icon: 'pi pi-eye',
        command: () => this.searchOnFileSales(row),
      },
      {
        label: this.i18n.tUi('transactions.search.searchAcq'),
        icon: 'pi pi-search',
        command: () => this.searchOnAcqSales(row),
      },
    ];
  }

  protected searchOnFileSales(row: TransactionsAcqInstallmentModel): void {
    const targetFilters = this.buildTargetFileFilters(row);

    localStorage.setItem(
      STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/file-processing/files']);
  }

  protected searchOnAcqSales(row: TransactionsAcqInstallmentModel): void {
    const targetFilters = this.buildTargetAcqSalesFilters(row);

    localStorage.setItem(STATE_KEY.CARDSYNC.ACQ.SALES.FILTERS.V1, JSON.stringify(targetFilters));
    localStorage.removeItem(STATE_KEY.CARDSYNC.ACQ.SALES.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/sales']);
  }

  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }

  protected buildTargetFileFilters(
    row: TransactionsAcqInstallmentModel,
  ): ProcessedFileFiltersState {
    return {
      ...createEmptyProcessedFileFiltersState(),
    };
  }

  protected buildTargetAcqSalesFilters(
    row: TransactionsAcqInstallmentModel,
  ): TransactionsAcqInstallmentFiltersState {
    const modality = normalizeModalityEnum(row.transaction?.modality);
    const statusTransaction = normalizeStatusTransactionEnum(row.transaction?.statusTransaction);
    return {
      ...createEmptyTransactionsAcqInstallmentFiltersState(),
      authorization: row.transaction?.authorization ?? '',
      cvNsu: row.transaction?.cvNsu != null ? String(row.transaction?.cvNsu) : '',

      flags: row.transaction?.flag?.id ? [row.transaction?.flag.id] : null,
      modality: modality && modality !== ModalityEnum.NULL ? [modality] : null,
      companies: row.transaction?.company?.id ? [row.transaction?.company.id] : null,
      acquirers: row.transaction?.acquirer?.id ? [row.transaction?.acquirer.id] : null,
      statusTransaction:
        statusTransaction && statusTransaction !== StatusTransactionEnum.NULL
          ? [statusTransaction]
          : null,
      establishments: row.transaction?.establishment?.id
        ? [row.transaction?.establishment.id]
        : null,

      periodSaleDate: row.transaction?.saleDate ? PeriodEnum.DAY : null,
      saleDate: row.transaction?.saleDate
        ? this.i18n.formatDateValue(row.transaction?.saleDate)
        : null,
    };
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.ACQ.INSTALLMENT.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.ACQ.INSTALLMENT.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.ACQ.INSTALLMENT.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<TransactionsAcqInstallmentAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.installmentFacade.loadPage(query);
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<TransactionsAcqInstallmentAdvancedFilters>>,
  ): void {
    this.installmentFacade.clearTotals();
    this.installmentFacade.loadPage(query);
  }

  protected override resetFilters(): void {
    resetTransactionsAcqInstallmentAdvancedFilters(this);
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;

    if (!filters) {
      return;
    }

    this.syncArrayColumnDraftFromTableState(
      filters,
      'flag',
      this.flagColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'capture',
      this.captureColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'modality',
      this.modalityColumnDraft,
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
      'company',
      this.companyColumnDraft,
      readArrayFilterValues,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'establishment',
      this.establishmentColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'grossValue',
      this.grossValueColumnDraft,
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
      'discountValue',
      this.discountValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'adjustmentValue',
      this.adjustmentValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'installment',
      this.installmentColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'cvNsu',
      this.cvNsuColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'authorization',
      this.authorizationColumnDraft,
      readSingleFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'saleDate',
      this.saleDateColumnPeriod,
      this.saleDateColumnDraft,
      readPeriodFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'expectedPaymentDate',
      this.expectedPaymentDateColumnPeriod,
      this.expectedPaymentDateColumnDraft,
      readPeriodFilterValue,
    );
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const captures = readArrayFilterValues(filters, 'capture');
    if (captures.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.capture'),
        value: captures
          .map((value) => captureEnumLabel(value as CaptureEnum, this.i18n))
          .join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.modality'),
        value: modalities
          .map((value) => modalityEnumLabel(value as ModalityEnum, this.i18n))
          .join(', '),
      });
    }

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((option) => flags.includes(option.id))
        .map((option) => option.name);

      items.push({
        label: this.i18n.tUi('transactions.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('transactions.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }
    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('transactions.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);

      items.push({
        label: this.i18n.tUi('transactions.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const saleDate = readPeriodFilterValue(filters, 'saleDate');
    if (saleDate?.period && saleDate.value) {
      items.push({
        label: this.i18n.tUi('transactions.fields.saleDate'),
        value: this.dateFilterLabel(saleDate),
      });
    }

    const expectedPaymentDate = readPeriodFilterValue(filters, 'expectedPaymentDate');
    if (expectedPaymentDate?.period && expectedPaymentDate.value) {
      items.push({
        label: this.i18n.tUi('transactions.fields.expectedPaymentDate'),
        value: this.dateFilterLabel(expectedPaymentDate),
      });
    }

    const grossValue = this.moneyFilterLabel(filters, 'grossValue');
    if (grossValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.grossValue'),
        value: grossValue,
      });
    }

    const adjustmentValue = this.moneyFilterLabel(filters, 'adjustmentValue');
    if (adjustmentValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.adjustmentValue'),
        value: adjustmentValue,
      });
    }

    const discountValue = this.moneyFilterLabel(filters, 'discountValue');
    if (discountValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.rate'),
        value: discountValue,
      });
    }

    const liquidValue = this.moneyFilterLabel(filters, 'liquidValue');
    if (liquidValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.liquid'),
        value: liquidValue,
      });
    }

    const installment = this.integerFilterLabel(filters, 'installment');
    if (installment) {
      items.push({
        label: this.i18n.tUi('transactions.fields.installments'),
        value: installment,
      });
    }

    const cvNsu = this.integerFilterLabel(filters, 'cvNsu');
    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('transactions.fields.cvNsu'),
        value: cvNsu,
      });
    }

    const authorization = this.integerFilterLabel(filters, 'authorization');
    if (authorization) {
      items.push({
        label: this.i18n.tUi('transactions.fields.authorization'),
        value: authorization,
      });
    }

    return items;
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const tid = this.tid();
    const flag = this.flags();
    const cvNsu = this.cvNsu();
    const capture = this.capture();
    const company = this.companies();
    const modality = this.modality();
    const acquirer = this.acquirers();
    const statusPaymentBank = this.statusPaymentBank();
    const authorization = this.authorization();
    const discountValueEnd = this.discountValueEnd();
    const statusTransaction = this.statusTransaction();

    const grossValueEnd = this.grossValueEnd();
    const liquidValueEnd = this.liquidValueEnd();
    const grossValueStart = this.grossValueStart();
    const liquidValueStart = this.liquidValueStart();
    const discountValueStart = this.discountValueStart();
    const adjustmentValueEnd = this.adjustmentValueEnd();
    const adjustmentValueStart = this.adjustmentValueStart();

    const establishment = this.establishments();

    const saleDate = this.saleDate();
    const periodSaleDate = this.periodSaleDate();

    const paymentDate = this.paymentDate();
    const periodPaymentDate = this.periodPaymentDate();

    const expectedPaymentDate = this.expectedPaymentDate();
    const periodExpectedPaymentDate = this.periodExpectedPaymentDate();

    const saleDateValue = this.formatActiveFilterPeriodDateValue(
      periodSaleDate,
      saleDate,
      this.i18n,
    );
    if (saleDateValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.saleDate'),
        value: saleDateValue,
      });
    }

    const paymentDateValue = this.formatActiveFilterPeriodDateValue(
      periodPaymentDate,
      paymentDate,
      this.i18n,
    );
    if (paymentDateValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.paymentDate'),
        value: paymentDateValue,
      });
    }

    const expectedPaymentDateValue = this.formatActiveFilterPeriodDateValue(
      periodExpectedPaymentDate,
      expectedPaymentDate,
      this.i18n,
    );
    if (expectedPaymentDateValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.expectedPaymentDate'),
        value: expectedPaymentDateValue,
      });
    }

    const discountValueLabel = currencyRangeLabel(this.i18n, discountValueStart, discountValueEnd);
    if (discountValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.discountValue'),
        value: discountValueLabel,
      });
    }

    const adjustmentValueLabel = currencyRangeLabel(
      this.i18n,
      adjustmentValueStart,
      adjustmentValueEnd,
    );
    if (adjustmentValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.adjustmentValue'),
        value: adjustmentValueLabel,
      });
    }

    const liquidValueLabel = currencyRangeLabel(this.i18n, liquidValueStart, liquidValueEnd);
    if (liquidValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.liquidValue'),
        value: liquidValueLabel,
      });
    }
    const grossValueLabel = currencyRangeLabel(this.i18n, grossValueStart, grossValueEnd);
    if (grossValueLabel) {
      items.push({
        label: this.i18n.tUi('transactions.fields.grossValue'),
        value: grossValueLabel,
      });
    }

    if (authorization) {
      items.push({
        label: this.i18n.tUi('transactions.fields.authorization'),
        value: authorization,
      });
    }

    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('transactions.fields.cvNsu'),
        value: cvNsu,
      });
    }

    if (tid) {
      items.push({
        label: this.i18n.tUi('transactions.fields.tid'),
        value: tid,
      });
    }

    if (capture?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.capture'),
        value: capture.map((v) => captureEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (statusTransaction?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.statusTransaction'),
        value: statusTransaction.map((v) => statusTransactionEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (statusPaymentBank?.length) {
      items.push({
        label: this.i18n.tUi('transactions.fields.statusPaymentBank'),
        value: statusPaymentBank.map((v) => statusPaymentBankEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.acquirer'),
        value: labels,
      });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.flag'),
        value: labels,
      });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.company'),
        value: labels,
      });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('transactions.fields.establishment'),
        value: labels,
      });
    }

    return items;
  });

  protected override toFiltersState(): TransactionsAcqInstallmentFiltersState {
    return {
      tid: this.tid(),
      cvNsu: this.cvNsu(),

      authorization: this.authorization(),
      grossValueEnd: this.grossValueEnd(),
      liquidValueEnd: this.liquidValueEnd(),
      grossValueStart: this.grossValueStart(),
      discountValueEnd: this.discountValueEnd(),
      liquidValueStart: this.liquidValueStart(),
      discountValueStart: this.discountValueStart(),
      adjustmentValueEnd: this.adjustmentValueEnd(),
      adjustmentValueStart: this.adjustmentValueStart(),

      flags: this.flags(),
      capture: this.capture(),
      modality: this.modality(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),
      statusPaymentBank: this.statusPaymentBank(),
      statusTransaction: this.statusTransaction(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),

      paymentDate: this.paymentDate(),
      periodPaymentDate: this.periodPaymentDate(),

      expectedPaymentDate: this.expectedPaymentDate(),
      periodExpectedPaymentDate: this.periodExpectedPaymentDate(),
    };
  }

  protected override applyFiltersState(s: TransactionsAcqInstallmentFiltersState): void {
    this.cvNsu.set(s.cvNsu ?? '');
    this.authorization.set(s.authorization ?? '');

    this.grossValueEnd.set(s.grossValueEnd ?? null);
    this.liquidValueEnd.set(s.liquidValueEnd ?? null);
    this.grossValueStart.set(s.grossValueStart ?? null);
    this.discountValueEnd.set(s.discountValueEnd ?? null);
    this.liquidValueStart.set(s.liquidValueStart ?? null);
    this.discountValueStart.set(s.discountValueStart ?? null);
    this.adjustmentValueEnd.set(s.adjustmentValueEnd ?? null);
    this.adjustmentValueStart.set(s.adjustmentValueStart ?? null);

    this.flags.set(s.flags ?? null);
    this.capture.set(s.capture ?? null);
    this.modality.set(s.modality ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);
    this.statusPaymentBank.set(s.statusPaymentBank ?? null);
    this.statusTransaction.set(s.statusTransaction ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate ?? null);

    this.paymentDate.set(s.paymentDate ?? null);
    this.periodPaymentDate.set(s.periodPaymentDate ?? null);

    this.expectedPaymentDate.set(s.expectedPaymentDate ?? null);
    this.periodExpectedPaymentDate.set(s.periodExpectedPaymentDate ?? null);
  }

  protected override buildAdvancedFilters(): Partial<TransactionsAcqInstallmentAdvancedFilters> {
    const grossValueEnd = this.grossValueEnd();
    const liquidValueEnd = this.liquidValueEnd();
    const grossValueStart = this.grossValueStart();
    const discountValueEnd = this.discountValueEnd();
    const liquidValueStart = this.liquidValueStart();
    const discountValueStart = this.discountValueStart();
    const adjustmentValueEnd = this.adjustmentValueEnd();
    const adjustmentValueStart = this.adjustmentValueStart();

    return {
      tid: this.tid().trim() || undefined,
      cvNsu: this.cvNsu().trim() || undefined,
      authorization: this.authorization().trim() || undefined,

      grossValueEnd: grossValueEnd ?? undefined,
      liquidValueEnd: liquidValueEnd ?? undefined,
      grossValueStart: grossValueStart ?? undefined,
      discountValueEnd: discountValueEnd ?? undefined,
      liquidValueStart: liquidValueStart ?? undefined,
      discountValueStart: discountValueStart ?? undefined,
      adjustmentValueEnd: adjustmentValueEnd ?? undefined,
      adjustmentValueStart: adjustmentValueStart ?? undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      capture: this.capture()?.length ? this.capture()! : undefined,
      modality: this.modality()?.length ? this.modality()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,
      statusPaymentBank: this.statusPaymentBank()?.length ? this.statusPaymentBank()! : undefined,
      statusTransaction: this.statusTransaction()?.length ? this.statusTransaction()! : undefined,

      saleDate: this.saleDate() ?? undefined,
      periodSaleDate: this.periodSaleDate() ?? undefined,

      paymentDate: this.paymentDate() ?? undefined,
      periodPaymentDate: this.periodPaymentDate() ?? undefined,

      expectedPaymentDate: this.expectedPaymentDate() ?? undefined,
      periodExpectedPaymentDate: this.periodExpectedPaymentDate() ?? undefined,
    };
  }

  protected onGrossValueRangeChange(value: CsCurrencyRangeValue): void {
    this.grossValueStart.set(value.start ?? null);
    this.grossValueEnd.set(value.end ?? null);
  }

  protected onAdjustmentValueRangeChange(value: CsCurrencyRangeValue): void {
    this.adjustmentValueStart.set(value.start ?? null);
    this.adjustmentValueEnd.set(value.end ?? null);
  }

  protected onLiquidValueRangeChange(value: CsCurrencyRangeValue): void {
    this.liquidValueStart.set(value.start ?? null);
    this.liquidValueEnd.set(value.end ?? null);
  }

  protected onDiscountValueRangeChange(value: CsCurrencyRangeValue): void {
    this.discountValueStart.set(value.start ?? null);
    this.discountValueEnd.set(value.end ?? null);
  }

  /* Metodos Tooltip Tabela */
  protected hasCvNsu(row: any): boolean {
    return row?.cvNsu !== null && row?.cvNsu !== undefined && row?.cvNsu !== '';
  }

  protected discountTooltip(row: any): string {
    const flexRate = 0;
    const rate = row?.contractedFee ?? null;

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.tooltip.mdrRate')}:`,
        value: rate != null && rate !== '' ? `${rate}%` : this.i18n.tUi('common.notInformedFemale'),
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.tooltip.flexRate')}:`,
        value: this.i18n.formatBrlCurrency(flexRate),
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.grossValue')}:`,
        value: this.i18n.formatBrlCurrency(row?.grossValue),
      },
      {
        label: `${this.i18n.tUi('transactions.fields.discountValue')}:`,
        value: this.i18n.formatBrlCurrency(row?.discountValue),
      },
      {
        label: `${this.i18n.tUi('transactions.fields.liquidValue')}:`,
        value: this.i18n.formatBrlCurrency(row?.liquidValue),
      },
    ]);
  }

  protected cvNsuTooltip(row: any): string {
    const tid = row?.tid || this.i18n.tUi('common.notInformed');
    const cardName = row?.cardName || this.i18n.tUi('common.notInformed');
    const issuer = row?.cardIssuerName || this.i18n.tUi('common.notInformed');
    const cardNumber = row?.cardNumber || this.i18n.tUi('common.notInformed');

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.fields.tid')}:`,
        value: tid,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.cardNumber')}:`,
        value: cardNumber,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.cardName')}:`,
        value: cardName,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.issuer')}:`,
        value: issuer,
      },
    ]);
  }

  protected infoTooltip(rows: Array<{ label: string; value: string; nowrap?: boolean }>): string {
    const content = rows
      .filter((row) => row.value !== null && row.value !== undefined && row.value !== '')
      .map((row) => this.infoTooltipRow(row.label, row.value, row.nowrap))
      .join('');

    return `<div class="cs-tooltip">${content}</div>`;
  }

  protected infoTooltipRow(label: string, value: string, nowrap = false): string {
    const nowrapClass = nowrap ? ' cs-tooltip-row-nowrap' : '';

    return `
    <div class="cs-tooltip-row${nowrapClass}">
      <span class="cs-tooltip-label">${label}</span>
      <span class="cs-tooltip-value">${value}</span>
    </div>
  `;
  }

  /* Metodos Tooltip Status */
  protected saleStatusTooltip(row: any): string {
    const status = installmentTooltipStatusLabel(row?.statusTransaction, this.i18n);
    const reason = statusTransactionReasonEnumLabel(row?.statusTransactionReason, this.i18n);

    const agency = row?.salesSummary?.bankingDomicile?.agency ?? '-';
    const bank = row?.salesSummary?.bankingDomicile?.bank?.name ?? '-';
    const account = row?.salesSummary?.bankingDomicile?.currentAccount ?? '-';

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.fields.status')}:`,
        value: status,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.reason')}:`,
        value: reason,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.bank')}:`,
        value: bank,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.agency')}:`,
        value: agency,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.account')}:`,
        value: account,
        nowrap: true,
      },
    ]);
  }

  protected installmentStatusTooltip(row: any): string {
    const status = installmentTooltipStatusLabel(row?.installmentStatus, this.i18n);

    const paymentDate = row?.paymentDate
      ? this.csDatePipe.transform(row.paymentDate, 'short')
      : '-';

    return this.infoTooltip([
      {
        label: `${this.i18n.tUi('transactions.fields.status')}:`,
        value: status,
        nowrap: true,
      },
      {
        label: `${this.i18n.tUi('transactions.fields.paymentDate')}:`,
        value: paymentDate,
        nowrap: true,
      },
    ]);
  }

  protected statusTooltipClass(statusTransaction: string): string {
    const tone = installmentStatusTooltipTone(statusTransaction);

    return `cs-info-tooltip cs-installment-tooltip cs-installment-tooltip-${tone}`;
  }

  protected statusIconTooltip(statusTransaction: string): string {
    const tone = installmentStatusTooltipTone(statusTransaction);

    if (tone === 'success') {
      return 'pi pi-thumbs-up cs-sale-status-icon cs-sale-status-icon-success';
    }

    if (tone === 'warn') {
      return 'pi pi-times cs-sale-status-icon cs-sale-status-icon-warning';
    }

    return 'pi pi-thumbs-down cs-sale-status-icon cs-sale-status-icon-danger';
  }
}
