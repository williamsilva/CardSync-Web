import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { FlagFacade } from '@features/facade/flag.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { TransactionsErpFacade } from '@features/facade/transaction-erp.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { TransactionsErpAdvancedFilters } from '@features/filter/transaction-erp.filters';
import { TransactionsErpFiltersState, TransactionsErpModel } from '@models/transactions-erp.models';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  allConciliationStatusEnum,
  conciliationStatusEnumLabel,
} from '@models/enums/conciliation-status.enum';
import {
  CaptureEnum,
  allCaptureEnum,
  captureEnumLabel,
  captureEnumSeverity,
} from '@models/enums/capture.enum';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

@Component({
  standalone: true,
  selector: 'app-transactions-erp-sales-list',
  templateUrl: './transactions-erp-sales-list.component.html',
  imports: [
    CommonModule,
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CsTagComponent,
    CsDocumentPipe,
    CsCurrencyPipe,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class TransactionsErpSalesListComponent
  extends StatefulListPage<TransactionsErpFiltersState, TransactionsErpAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly erpSalesFacade = inject(TransactionsErpFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.erpSalesFacade.totalRecords());
  readonly sales = computed<TransactionsErpModel[]>(() => this.erpSalesFacade.sales());

  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  /* Campos Avançados*/
  readonly tid = signal('');
  readonly cvNsu = signal('');
  readonly machine = signal('');
  readonly cardNumber = signal('');
  readonly authorization = signal('');
  readonly flags = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly capture = signal<CaptureEnum[] | null>(null);
  readonly establishments = signal<string[] | null>(null);
  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly periodSaleDate = signal<PeriodEnum | null>(null);
  readonly saleDate = signal<string | string[] | null>(null);
  readonly conciliationStatus = signal<string[] | null>(null);
  readonly periodPaymentDate = signal<PeriodEnum | null>(null);
  readonly paymentDate = signal<string | string[] | null>(null);
  readonly periodConciliationDate = signal<PeriodEnum | null>(null);
  readonly conciliationDate = signal<string | string[] | null>(null);
  readonly periodExpectedPaymentDate = signal<PeriodEnum | null>(null);
  readonly expectedPaymentDate = signal<string | string[] | null>(null);

  /* Campos Tabela*/
  cvNsuColumnDraft = signal('');
  grossValueColumnDraft = signal('');
  liquidValueColumnDraft = signal('');
  installmentColumnDraft = signal('');
  authorizationColumnDraft = signal('');
  discountValueColumnDraft = signal('');
  adjustmentValueColumnDraft = signal('');
  flagColumnDraft = signal<string[] | null>(null);
  companyColumnDraft = signal<string[] | null>(null);
  captureColumnDraft = signal<string[] | null>(null);
  acquirerColumnDraft = signal<string[] | null>(null);
  modalityColumnDraft = signal<string[] | null>(null);
  saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  establishmentColumnDraft = signal<string[] | null>(null);
  saleDateColumnDraft = signal<string | string[] | null>(null);
  expectedPaymentDateColumnPeriod = signal<PeriodEnum | null>(null);
  expectedPaymentDateColumnDraft = signal<string | string[] | null>(null);

  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isPaymentDateDisabled = computed(() => !this.periodPaymentDate());
  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());
  readonly isConciliationDateDisabled = computed(() => !this.periodConciliationDate());
  readonly isExpectedPaymentDateDisabled = computed(() => !this.periodExpectedPaymentDate());

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

  readonly conciliationStatusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allConciliationStatusEnum().map((value) => ({
      label: conciliationStatusEnumLabel(value, this.i18n),
      value,
    }));
  });

  ngOnInit(): void {
    this.flagFacade.loadCompanyOptionsFilter();
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
    console.log('Key ', key);

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.erpSalesFacade.clearTotals();

    this.resetFilters();

    this.flagColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.modalityColumnDraft.set(null);
    this.captureColumnDraft.set(null);
    this.establishmentColumnDraft.set(null);

    this.cvNsuColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.liquidValueColumnDraft.set('');
    this.installmentColumnDraft.set('');
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

  calculateTotals(): void {
    this.erpSalesFacade.calculateTotals();
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

  protected override tableStateKey(): string {
    return 'cardsync.erp.sales.table.state.v1';
  }

  protected override tableRowsKey(): string {
    return 'erp.sales.table.rows';
  }

  protected override filtersKey(): string {
    return 'cardsync.erp.sales.filters.v1';
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<TransactionsErpAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.erpSalesFacade.loadPage(query);
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<TransactionsErpAdvancedFilters>>,
  ): void {
    this.erpSalesFacade.clearTotals();
    this.erpSalesFacade.loadPage(query);
  }

  protected override resetFilters(): void {
    this.flags.set(null);
    this.capture.set(null);
    this.modality.set(null);
    this.saleDate.set(null);
    this.acquirers.set(null);
    this.companies.set(null);
    this.paymentDate.set(null);
    this.establishments.set(null);
    this.periodSaleDate.set(null);
    this.conciliationDate.set(null);
    this.periodPaymentDate.set(null);
    this.conciliationStatus.set(null);
    this.expectedPaymentDate.set(null);
    this.periodConciliationDate.set(null);
    this.periodExpectedPaymentDate.set(null);

    this.tid.set('');
    this.cvNsu.set('');
    this.machine.set('');
    this.cardNumber.set('');
    this.authorization.set('');
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

    this.syncArrayColumnDraftFromTableState(
      filters,
      'establishment',
      this.establishmentColumnDraft,
      readArrayFilterValues,
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
        label: this.i18n.tUi('erp.fields.capture'),
        value: captures
          .map((value) => captureEnumLabel(value as CaptureEnum, this.i18n))
          .join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('erp.fields.modality'),
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
        label: this.i18n.tUi('erp.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('erp.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }
    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('erp.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);

      items.push({
        label: this.i18n.tUi('erp.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const saleDate = readPeriodFilterValue(filters, 'saleDate');
    if (saleDate?.period && saleDate.value) {
      items.push({
        label: this.i18n.tUi('erp.fields.saleDate'),
        value: this.dateFilterLabel(saleDate),
      });
    }

    const expectedPaymentDate = readPeriodFilterValue(filters, 'expectedPaymentDate');
    if (expectedPaymentDate?.period && expectedPaymentDate.value) {
      items.push({
        label: this.i18n.tUi('erp.fields.expectedPaymentDate'),
        value: this.dateFilterLabel(expectedPaymentDate),
      });
    }

    const grossValue = this.moneyFilterLabel(filters, 'grossValue');
    if (grossValue) {
      items.push({
        label: this.i18n.tUi('erp.fields.grossValue'),
        value: grossValue,
      });
    }

    const adjustmentValue = this.moneyFilterLabel(filters, 'adjustmentValue');
    if (adjustmentValue) {
      items.push({
        label: this.i18n.tUi('erp.fields.adjustmentValue'),
        value: adjustmentValue,
      });
    }

    const discountValue = this.moneyFilterLabel(filters, 'discountValue');
    if (discountValue) {
      items.push({
        label: this.i18n.tUi('erp.fields.discountValue'),
        value: discountValue,
      });
    }

    const liquidValue = this.moneyFilterLabel(filters, 'liquidValue');
    if (liquidValue) {
      items.push({
        label: this.i18n.tUi('erp.fields.liquidValue'),
        value: liquidValue,
      });
    }

    const installment = this.integerFilterLabel(filters, 'installment');
    if (installment) {
      items.push({
        label: this.i18n.tUi('erp.fields.installment'),
        value: installment,
      });
    }

    const cvNsu = this.integerFilterLabel(filters, 'cvNsu');
    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('erp.fields.cvNsu'),
        value: cvNsu,
      });
    }

    const authorization = this.integerFilterLabel(filters, 'authorization');
    if (authorization) {
      items.push({
        label: this.i18n.tUi('erp.fields.authorization'),
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
    const machine = this.machine();
    const capture = this.capture();
    const company = this.companies();
    const modality = this.modality();
    const acquirer = this.acquirers();
    const cardNumber = this.cardNumber();
    const authorization = this.authorization();
    const establishment = this.establishments();
    const conciliationStatus = this.conciliationStatus();

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
        label: this.i18n.tUi('erp.fields.saleDate'),
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
        label: this.i18n.tUi('erp.fields.paymentDate'),
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
        label: this.i18n.tUi('erp.fields.expectedPaymentDate'),
        value: expectedPaymentDateValue,
      });
    }

    if (machine) {
      items.push({
        label: this.i18n.tUi('erp.fields.machine'),
        value: machine,
      });
    }

    if (cardNumber) {
      items.push({
        label: this.i18n.tUi('erp.fields.cardNumber'),
        value: cardNumber,
      });
    }

    if (authorization) {
      items.push({
        label: this.i18n.tUi('erp.fields.authorization'),
        value: authorization,
      });
    }

    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('erp.fields.cvNsu'),
        value: cvNsu,
      });
    }

    if (tid) {
      items.push({
        label: this.i18n.tUi('erp.fields.tid'),
        value: tid,
      });
    }

    if (capture?.length) {
      items.push({
        label: this.i18n.tUi('erp.fields.capture'),
        value: capture.map((v) => captureEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('erp.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (conciliationStatus?.length) {
      items.push({
        label: this.i18n.tUi('erp.fields.conciliationStatus'),
        value: conciliationStatus.map((v) => conciliationStatusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('erp.fields.acquirer'),
        value: labels,
      });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('erp.fields.flag'),
        value: labels,
      });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('erp.fields.company'),
        value: labels,
      });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('erp.fields.establishment'),
        value: labels,
      });
    }

    return items;
  });

  protected override toFiltersState(): TransactionsErpFiltersState {
    return {
      tid: this.tid(),
      cvNsu: this.cvNsu(),
      machine: this.machine(),
      capture: this.capture(),
      cardNumber: this.cardNumber(),
      authorization: this.authorization(),
      conciliationStatus: this.conciliationStatus(),

      flags: this.flags(),
      modality: this.modality(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),

      paymentDate: this.paymentDate(),
      periodPaymentDate: this.periodPaymentDate(),

      expectedPaymentDate: this.expectedPaymentDate(),
      periodExpectedPaymentDate: this.periodExpectedPaymentDate(),

      conciliationDate: this.conciliationDate(),
      periodConciliationDate: this.periodConciliationDate(),
    };
  }

  protected override applyFiltersState(s: TransactionsErpFiltersState): void {
    this.tid.set(s.tid ?? '');
    this.cvNsu.set(s.cvNsu ?? '');
    this.machine.set(s.machine ?? '');
    this.cardNumber.set(s.cardNumber ?? '');
    this.authorization.set(s.authorization ?? '');
    this.conciliationStatus.set(s.conciliationStatus ?? null);

    this.flags.set(s.flags ?? null);
    this.capture.set(s.capture ?? null);
    this.modality.set(s.modality ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate);

    this.paymentDate.set(s.paymentDate ?? null);
    this.periodPaymentDate.set(s.periodPaymentDate);

    this.expectedPaymentDate.set(s.expectedPaymentDate ?? null);
    this.periodExpectedPaymentDate.set(s.periodExpectedPaymentDate);

    this.conciliationDate.set(s.conciliationDate ?? null);
    this.periodConciliationDate.set(s.periodConciliationDate ?? null);
  }

  protected override buildAdvancedFilters(): Partial<TransactionsErpAdvancedFilters> {
    return {
      tid: this.tid().trim() || undefined,
      cvNsu: this.cvNsu().trim() || undefined,
      machine: this.machine().trim() || undefined,
      cardNumber: this.cardNumber().trim() || undefined,
      authorization: this.authorization().trim() || undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      capture: this.capture()?.length ? this.capture()! : undefined,
      modality: this.modality()?.length ? this.modality()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      conciliationStatus: this.conciliationStatus()?.length
        ? this.conciliationStatus()!
        : undefined,

      saleDate: this.saleDate() ?? undefined,
      periodSaleDate: this.periodSaleDate() ?? undefined,

      paymentDate: this.paymentDate() ?? undefined,
      periodPaymentDate: this.periodPaymentDate() ?? undefined,

      expectedPaymentDate: this.expectedPaymentDate() ?? undefined,
      periodExpectedPaymentDate: this.periodExpectedPaymentDate() ?? undefined,

      conciliationDate: this.conciliationDate() ?? undefined,
      periodConciliationDate: this.periodConciliationDate() ?? undefined,
    };
  }
}
