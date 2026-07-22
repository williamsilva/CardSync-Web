import { FormsModule } from '@angular/forms';

import { inject, signal, computed, Component, ViewChild, AfterViewInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FloatLabel } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';

import { CsTagComponent, CsTagTone } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { CsPercentPipe } from '@shared/pipes/cs-percent.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { ContractAuditModel } from '@models/contract-audit.models';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { ContractAuditFacade } from '@features/facade/contract-audit.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  ContractAuditFiltersState,
  ContractAuditAdvancedFilters,
  resetContractAuditAdvancedFilters,
} from '@features/filter/contract-audit.filters';
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
  percentRangeLabel,
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  CaptureEnum,
  allCaptureEnum,
  captureEnumLabel,
  captureEnumSeverity,
} from '@models/enums/capture.enum';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'cs-contract-audit-list',
  styleUrl: './contract-audit-list.component.scss',
  templateUrl: './contract-audit-list.component.html',
  imports: [
    CsDatePipe,
    FloatLabel,
    FormsModule,
    TableModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    CsPercentPipe,
    CheckboxModule,
    CsDocumentPipe,
    CsTagComponent,
    CsCurrencyPipe,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective
],
})
export class ContractAuditListComponent
  extends StatefulListPage<ContractAuditFiltersState, ContractAuditAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  override readonly i18n = inject(I18nService);

  readonly flagFacade = inject(FlagFacade);
  readonly facade = inject(ContractAuditFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly selectedRows = signal<ContractAuditModel[]>([]);

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly sales = computed<ContractAuditModel[]>(() => this.facade.sales());

  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());

  override rows = Number(localStorage.getItem(this.tableRowsKey())) || 13;

  /* Campos Filtros avançados */
  readonly cvNsu = signal('');
  readonly authorization = signal('');

  readonly grossValueEnd = signal<number | null>(null);
  readonly grossValueStart = signal<number | null>(null);

  readonly appliedFeeValueEnd = signal<number | null>(null);
  readonly appliedFeeValueStart = signal<number | null>(null);

  readonly liquidValueEnd = signal<number | null>(null);
  readonly liquidValueStart = signal<number | null>(null);

  readonly differenceValueEnd = signal<number | null>(null);
  readonly differenceValueStart = signal<number | null>(null);

  readonly flags = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly capture = signal<CaptureEnum[] | null>(null);
  readonly establishments = signal<string[] | null>(null);
  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly periodSaleDate = signal<PeriodEnum | null>(null);
  readonly saleDate = signal<string | string[] | null>(null);

  readonly appliedFeeValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.appliedFeeValueStart(),
    end: this.appliedFeeValueEnd(),
  }));

  readonly differenceValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.differenceValueStart(),
    end: this.differenceValueEnd(),
  }));

  readonly liquidValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.liquidValueStart(),
    end: this.liquidValueEnd(),
  }));

  readonly grossValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.grossValueStart(),
    end: this.grossValueEnd(),
  }));

  /* Campos Tabela */
  readonly cvNsuColumnDraft = signal('');
  readonly grossValueColumnDraft = signal('');
  readonly liquidValueColumnDraft = signal('');
  readonly installmentColumnDraft = signal('');
  readonly rateContractColumnDraft = signal('');
  readonly authorizationColumnDraft = signal('');
  readonly differenceValueColumnDraft = signal('');
  readonly liquidValueErpColumnDraft = signal('');
  readonly appliedFeeValueColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly captureColumnDraft = signal<string[] | null>(null);
  readonly modalityColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);
  readonly saleDateColumnDraft = signal<string | string[] | null>(null);

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

  readonly captureEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allCaptureEnum().map((value) => ({
      label: captureEnumLabel(value, this.i18n),
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
    this.selectedRows.set([]);
    const key = this.tableStateKey();

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();

    this.cvNsuColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.liquidValueColumnDraft.set('');
    this.installmentColumnDraft.set('');
    this.rateContractColumnDraft.set('');
    this.authorizationColumnDraft.set('');
    this.differenceValueColumnDraft.set('');
    this.liquidValueErpColumnDraft.set('');
    this.appliedFeeValueColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.captureColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.modalityColumnDraft.set(null);
    this.saleDateColumnDraft.set(null);
    this.saleDateColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusEnumLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
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
    return STATE_KEY.CARDSYNC.CONCILIATION.FEES.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.FEES.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.FEES.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<ContractAuditFiltersState>>,
  ): void {
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<ContractAuditAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetContractAuditAdvancedFilters(this);
  }

  /* Filtros Avançados*/
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const flag = this.flags();
    const cvNsu = this.cvNsu();
    const capture = this.capture();
    const company = this.companies();
    const modality = this.modality();
    const acquirer = this.acquirers();
    const authorization = this.authorization();

    const grossValueEnd = this.grossValueEnd();
    const grossValueStart = this.grossValueStart();

    const appliedFeeValueEnd = this.appliedFeeValueEnd();
    const appliedFeeValueStart = this.appliedFeeValueStart();

    const differenceValueEnd = this.differenceValueEnd();
    const differenceValueStart = this.differenceValueStart();

    const liquidValueEnd = this.liquidValueEnd();
    const liquidValueStart = this.liquidValueStart();

    const establishment = this.establishments();

    const saleDate = this.saleDate();
    const periodSaleDate = this.periodSaleDate();

    const saleDateValue = this.formatActiveFilterPeriodDateValue(
      periodSaleDate,
      saleDate,
      this.i18n,
    );

    if (saleDateValue) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.saleDate'),
        value: saleDateValue,
      });
    }

    const appliedFeeValueLabel = percentRangeLabel(
      this.i18n,
      appliedFeeValueStart,
      appliedFeeValueEnd,
    );
    if (appliedFeeValueLabel) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.appliedFeeValue'),
        value: appliedFeeValueLabel,
      });
    }

    const liquidValueLabel = currencyRangeLabel(this.i18n, liquidValueStart, liquidValueEnd);
    if (liquidValueLabel) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.liquidValue'),
        value: liquidValueLabel,
      });
    }

    const differenceValueLabel = currencyRangeLabel(
      this.i18n,
      differenceValueStart,
      differenceValueEnd,
    );
    if (differenceValueLabel) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.differenceValue'),
        value: differenceValueLabel,
      });
    }

    const grossValueLabel = currencyRangeLabel(this.i18n, grossValueStart, grossValueEnd);
    if (grossValueLabel) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.grossValue'),
        value: grossValueLabel,
      });
    }

    if (authorization) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.authorization'),
        value: authorization,
      });
    }

    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.cvNsu'),
        value: cvNsu,
      });
    }

    if (capture?.length) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.capture'),
        value: capture.map((v) => captureEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.acquirer'),
        value: labels,
      });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.flag'),
        value: labels,
      });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.company'),
        value: labels,
      });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.establishment'),
        value: labels,
      });
    }

    return items;
  });

  protected override buildAdvancedFilters(): Partial<ContractAuditAdvancedFilters> {
    const grossValueEnd = this.grossValueEnd();
    const grossValueStart = this.grossValueStart();

    const appliedFeeValueEnd = this.appliedFeeValueEnd();
    const appliedFeeValueStart = this.appliedFeeValueStart();

    const liquidValueEnd = this.liquidValueEnd();
    const liquidValueStart = this.liquidValueStart();

    const differenceValueEnd = this.differenceValueEnd();
    const differenceValueStart = this.differenceValueStart();

    return {
      cvNsu: this.cvNsu().trim() || undefined,
      authorization: this.authorization().trim() || undefined,

      grossValueEnd: grossValueEnd ?? undefined,
      grossValueStart: grossValueStart ?? undefined,

      appliedFeeValueEnd: appliedFeeValueEnd ?? undefined,
      appliedFeeValueStart: appliedFeeValueStart ?? undefined,

      liquidValueEnd: liquidValueEnd ?? undefined,
      liquidValueStart: liquidValueStart ?? undefined,

      differenceValueEnd: differenceValueEnd ?? undefined,
      differenceValueStart: differenceValueStart ?? undefined,

      flags: this.flags()?.length ? this.flags()! : undefined,
      capture: this.capture()?.length ? this.capture()! : undefined,
      modality: this.modality()?.length ? this.modality()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      saleDate: this.saleDate() ?? undefined,
      periodSaleDate: this.periodSaleDate() ?? undefined,
    };
  }

  protected onAppliedFeeValueRangeChange(value: CsCurrencyRangeValue): void {
    this.appliedFeeValueStart.set(value.start ?? null);
    this.appliedFeeValueEnd.set(value.end ?? null);
  }

  protected onLiquidValueRangeChange(value: CsCurrencyRangeValue): void {
    this.liquidValueStart.set(value.start ?? null);
    this.liquidValueEnd.set(value.end ?? null);
  }

  protected onFeeDifferenceRangeChange(value: CsCurrencyRangeValue): void {
    this.differenceValueStart.set(value.start ?? null);
    this.differenceValueEnd.set(value.end ?? null);
  }

  protected onGrossValueRangeChange(value: CsCurrencyRangeValue): void {
    this.grossValueStart.set(value.start ?? null);
    this.grossValueEnd.set(value.end ?? null);
  }

  /*End Filtros Avançados */
  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

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
      'differenceValue',
      this.differenceValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'liquidValueErp',
      this.liquidValueErpColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'rateContract',
      this.rateContractColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'appliedFeeValue',
      this.appliedFeeValueColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'installment',
      this.installmentColumnDraft,
      readSingleFilterValue,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'acquirer',
      this.acquirerColumnDraft,
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
      'capture',
      this.captureColumnDraft,
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
      'saleDate',
      this.saleDateColumnPeriod,
      this.saleDateColumnDraft,
      readPeriodFilterValue,
    );
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const captures = readArrayFilterValues(filters, 'capture');
    if (captures.length) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.capture'),
        value: captures
          .map((value) => captureEnumLabel(value as CaptureEnum, this.i18n))
          .join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.modality'),
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
        label: this.i18n.tUi('conciliation.contractAudit.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }
    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);

      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const saleDate = readPeriodFilterValue(filters, 'saleDate');
    if (saleDate?.period && saleDate.value) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.saleDate'),
        value: this.dateFilterLabel(saleDate),
      });
    }

    const grossValue = this.moneyFilterLabel(filters, 'grossValue');
    if (grossValue) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.grossValue'),
        value: grossValue,
      });
    }

    const cvNsu = this.integerFilterLabel(filters, 'cvNsu');
    if (cvNsu) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.cvNsu'),
        value: cvNsu,
      });
    }

    const authorization = this.integerFilterLabel(filters, 'authorization');
    if (authorization) {
      items.push({
        label: this.i18n.tUi('conciliation.contractAudit.fields.authorization'),
        value: authorization,
      });
    }
    return items;
  }

  protected override toFiltersState(): ContractAuditFiltersState {
    return {
      cvNsu: this.cvNsu(),
      capture: this.capture(),
      authorization: this.authorization(),

      grossValueEnd: this.grossValueEnd(),
      grossValueStart: this.grossValueStart(),

      appliedFeeValueEnd: this.appliedFeeValueEnd(),
      appliedFeeValueStart: this.appliedFeeValueStart(),

      liquidValueEnd: this.liquidValueEnd(),
      liquidValueStart: this.liquidValueStart(),

      differenceValueEnd: this.differenceValueEnd(),
      differenceValueStart: this.differenceValueStart(),

      flags: this.flags(),
      modality: this.modality(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),
    };
  }

  protected override applyFiltersState(s: ContractAuditFiltersState): void {
    this.cvNsu.set(s.cvNsu ?? '');
    this.authorization.set(s.authorization ?? '');

    this.grossValueEnd.set(s.grossValueEnd ?? null);
    this.liquidValueEnd.set(s.liquidValueEnd ?? null);
    this.grossValueStart.set(s.grossValueStart ?? null);
    this.liquidValueStart.set(s.liquidValueStart ?? null);
    this.appliedFeeValueEnd.set(s.appliedFeeValueEnd ?? null);
    this.appliedFeeValueStart.set(s.appliedFeeValueStart ?? null);

    this.differenceValueEnd.set(s.differenceValueEnd ?? null);
    this.differenceValueStart.set(s.differenceValueStart ?? null);

    this.flags.set(s.flags ?? null);
    this.capture.set(s.capture ?? null);
    this.modality.set(s.modality ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate ?? null);
  }

  /* Tabela Resumo */
  readonly selectedSummary = computed(() => {
    return this.selectedRows().reduce(
      (summary, row) => {
        const acquirerGross = this.toNumber(row.grossValue);
        const acquirerLiquid = this.toNumber(row.liquidValue);
        const acquirerFee =
          this.firstNumber(row, 'appliedFeeValue', 'feeValue', 'discountValue') ??
          Math.max(acquirerGross - acquirerLiquid, 0);

        const auditGross =
          this.firstNumber(row, 'expectedGrossValue', 'erpGrossValue') ??
          this.toNumberOrNull(row.transactionErp?.grossValue) ??
          acquirerGross;

        const auditLiquid =
          this.firstNumber(row, 'expectedLiquidValue', 'erpLiquidValue') ??
          this.toNumberOrNull(row.transactionErp?.liquidValue) ??
          0;

        const auditFee =
          this.firstNumber(row, 'expectedFeeValue', 'contractFeeValue') ??
          Math.max(auditGross - auditLiquid, 0);

        summary.sales += 1;
        summary.acquirerGross += acquirerGross;
        summary.acquirerFee += acquirerFee;
        summary.acquirerLiquid += acquirerLiquid;
        summary.auditGross += auditGross;
        summary.auditFee += auditFee;
        summary.auditLiquid += auditLiquid;
        summary.refundValue += this.toNumber(row.differenceValue);

        return summary;
      },
      {
        sales: 0,
        acquirerGross: 0,
        acquirerFee: 0,
        acquirerLiquid: 0,
        auditGross: 0,
        auditFee: 0,
        auditLiquid: 0,
        refundValue: 0,
      },
    );
  });

  private toNumber(value: unknown): number {
    return this.toNumberOrNull(value) ?? 0;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/\./g, '').replace(',', '.');
      const parsed = Number(normalized);

      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private firstNumber(row: ContractAuditModel, ...fields: string[]): number | null {
    const record = row as unknown as Record<string, unknown>;

    for (const field of fields) {
      const value = record[field];

      if (value !== null && value !== undefined && value !== '') {
        return this.toNumber(value);
      }
    }

    return null;
  }
  /*End Tabela resumo */
  /* CheckBox Table */
  protected readonly headerChecked = computed(() => {
    const eligible = this.headerEligibleRows();
    return eligible.length > 0 && eligible.every((row) => this.isRowSelected(row));
  });

  protected readonly headerEligibleRows = computed(() => {
    const rows = this.sales().filter((row) => !!row?.id);

    if (!rows.length) return [];

    const groupKey = this.selectedGroupKey() ?? this.selectionGroupKey(rows[0]);

    return rows.filter((row) => this.selectionGroupKey(row) === groupKey);
  });

  protected readonly selectedGroupKey = computed(() => {
    const firstSelected = this.selectedRows()[0];
    return firstSelected ? this.selectionGroupKey(firstSelected) : null;
  });

  protected readonly headerIndeterminate = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;

    const selectedCount = eligible.filter((row) => this.isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < eligible.length;
  });

  protected isRowSelected(row: ContractAuditModel): boolean {
    const id = row?.id;
    return !!id && this.selectedRows().some((selected) => selected?.id === id);
  }

  protected toggleHeaderSelection(checked: boolean): void {
    const eligible = this.headerEligibleRows();

    if (!checked) {
      const eligibleIds = new Set(eligible.map((row) => row.id));
      this.selectedRows.set(this.selectedRows().filter((row) => !eligibleIds.has(row.id)));
      return;
    }

    const selectedById = new Map(this.selectedRows().map((row) => [row.id, row]));

    for (const row of eligible) {
      selectedById.set(row.id, row);
    }

    this.selectedRows.set([...selectedById.values()]);
  }

  protected isRowCheckboxDisabled(row: ContractAuditModel): boolean {
    if (this.isRowSelected(row)) return false;

    return !!!row.id || !this.isSameSelectionGroup(row);
  }

  protected isSameSelectionGroup(row: ContractAuditModel): boolean {
    const selectedGroupKey = this.selectedGroupKey();

    if (!selectedGroupKey) return true;

    return this.selectionGroupKey(row) === selectedGroupKey;
  }

  protected toggleRowSelection(row: ContractAuditModel, checked: boolean): void {
    const id = row?.id;
    if (!id) return;

    const current = this.selectedRows();

    if (!checked) {
      this.selectedRows.set(current.filter((selected) => selected?.id !== id));
      return;
    }

    if (this.isRowCheckboxDisabled(row) || this.isRowSelected(row)) {
      return;
    }

    this.selectedRows.set([...current, row]);
  }

  protected selectionGroupKey(row: ContractAuditModel): string {
    return [row.company?.id, row.establishment?.id, row.flag?.id, row.acquirer?.id].join('|');
  }
  /* End CheckBox Table */
}
