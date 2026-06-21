import { CommonModule } from '@angular/common';
import {
  inject,
  OnInit,
  signal,
  computed,
  Component,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import { finalize } from 'rxjs';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { Checkbox } from 'primeng/checkbox';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelect } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { ToastService } from '@core/toast/toast.service';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { BatchDialogComponent } from '../dialogs/batch-dialog.component';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { ConciliationWaitingFacade } from '@features/facade/conciliation-waiting.facade';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  DeleteErpConfirmPayload,
  ErpVsAcquirerConfirmAction,
  ErpVsAcquirerActionDialogComponent,
} from '../dialogs/action-dialog.component';
import {
  ErpEditIdentityPayload,
  ErpEditIdentityDialogComponent,
} from '../dialogs/erp-edit-identity-dialog.component';
import {
  ConciliationWaitingFiltersState,
  ConciliationWaitingAdvancedFilters,
  resetConciliationWaitingAdvancedFilters,
} from '@features/filter/conciliation-waiting.filter';
import {
  ConciliationWaitingModel,
  ErpAcquirerResolutionResultModel,
  ErpAcquirerBatchResolutionResultModel,
} from '@models/conciliation-waiting.model';
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
  StatusTransactionReasonEnum,
  allStatusTransactionReasonEnum,
  statusTransactionReasonEnumLabel,
  statusTransactionReasonEnumSeverity,
} from '@models/enums/status-transaction-reason.enum';
import {
  CaptureEnum,
  allCaptureEnum,
  captureEnumLabel,
  captureEnumSeverity,
} from '@models/enums/capture.enum';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-missing-acquirer-list',
  templateUrl: './missing-acquirer-list.component.html',
  imports: [
    CommonModule,
    Select,
    Tooltip,
    Checkbox,
    CsDatePipe,
    RouterLink,
    DatePicker,
    FloatLabel,
    FormsModule,
    TableModule,
    MultiSelect,
    ButtonModule,
    CsTagComponent,
    CsCurrencyPipe,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    BatchDialogComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    ErpEditIdentityDialogComponent,
    ErpVsAcquirerActionDialogComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class MissingAcquirerListComponent
  extends StatefulListPage<ConciliationWaitingFiltersState, ConciliationWaitingAdvancedFilters>
  implements OnInit, AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  protected readonly resolving = signal(false);
  protected readonly batchDialogVisible = signal(false);
  protected readonly actionDialogVisible = signal(false);
  protected readonly editIdentityDialogVisible = signal(false);
  protected readonly pendingBatchAction = signal<any | null>(null);
  protected readonly pendingConfirmAction = signal<ErpVsAcquirerConfirmAction | null>(null);
  protected readonly pendingEditRow = signal<ConciliationWaitingModel | null>(null);

  protected readonly pendingEditNsu = computed<number | null>(() => {
    const nsu = this.pendingEditRow()?.cvNsu;
    if (nsu == null) return null;
    const n = Number(nsu);
    return Number.isFinite(n) ? n : null;
  });

  protected readonly pendingEditAuthorization = computed<string | null>(() => {
    return this.pendingEditRow()?.authorization ?? null;
  });

  protected readonly toast = inject(ToastService);
  protected readonly facade = inject(ConciliationWaitingFacade);
  protected readonly selectedRows = signal<ConciliationWaitingModel[]>([]);
  protected readonly pendingConfirmRow = signal<ConciliationWaitingModel | null>(null);

  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly sales = computed<ConciliationWaitingModel[]>(() => this.facade.sales());

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
  readonly liquidValueStart = signal<number | null>(null);

  readonly flags = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly capture = signal<CaptureEnum[] | null>(null);
  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly establishments = signal<string[] | null>(null);
  readonly periodSaleDate = signal<PeriodEnum | null>(null);
  readonly saleDate = signal<string | string[] | null>(null);

  /* Campos Tabela*/
  cvNsuColumnDraft = signal('');
  grossValueColumnDraft = signal('');
  liquidValueColumnDraft = signal('');
  installmentColumnDraft = signal('');
  authorizationColumnDraft = signal('');

  flagColumnDraft = signal<string[] | null>(null);
  companyColumnDraft = signal<string[] | null>(null);
  captureColumnDraft = signal<string[] | null>(null);
  acquirerColumnDraft = signal<string[] | null>(null);
  modalityColumnDraft = signal<string[] | null>(null);
  saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  establishmentColumnDraft = signal<string[] | null>(null);
  saleDateColumnDraft = signal<string | string[] | null>(null);
  statusTransactionReasonColumnDraft = signal<string[] | null>(null);

  readonly batchRows = computed(() => this.selectedDeleteRows());
  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());

  readonly grossValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.grossValueStart(),
    end: this.grossValueEnd(),
  }));

  readonly liquidValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.liquidValueStart(),
    end: this.liquidValueEnd(),
  }));

  protected readonly selectedDeleteRows = computed(() =>
    this.selectedRows().filter((row) => this.canMarkErpAsDeleted(row)),
  );

  protected readonly headerEligibleRows = computed(() =>
    this.sales().filter((row) => this.canMarkErpAsDeleted(row)),
  );

  protected readonly headerChecked = computed(() => {
    const eligible = this.headerEligibleRows();
    return eligible.length > 0 && eligible.every((row) => this.isRowSelected(row));
  });

  protected readonly headerIndeterminate = computed(() => {
    const eligible = this.headerEligibleRows();
    if (!eligible.length) return false;

    const selectedCount = eligible.filter((row) => this.isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < eligible.length;
  });

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly statusTransactionReasonEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusTransactionReasonEnum().map((value) => ({
      label: statusTransactionReasonEnumLabel(value, this.i18n),
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

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
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

  statusTransactionReasonEnumLabel(value: StatusTransactionReasonEnum | null): string {
    return statusTransactionReasonEnumLabel(value, this.i18n);
  }

  statusTransactionReasonEnumSeverity(value: StatusTransactionReasonEnum | null): CsTagTone {
    return statusTransactionReasonEnumSeverity(value);
  }

  clear(): void {
    const key = this.tableStateKey();

    this.selectedRows.set([]);
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.facade.clearTotals();

    this.resetFilters();

    this.cvNsuColumnDraft.set('');
    this.grossValueColumnDraft.set('');
    this.liquidValueColumnDraft.set('');
    this.installmentColumnDraft.set('');
    this.authorizationColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.captureColumnDraft.set(null);
    this.modalityColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.saleDateColumnDraft.set(null);
    this.saleDateColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);
    this.statusTransactionReasonColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ACQ.TABLE.ROWS.V1;
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ACQ.TABLE.STATE.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ACQ.FILTERS.V1;
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetConciliationWaitingAdvancedFilters(this);
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<ConciliationWaitingFiltersState>>,
  ): void {
    this.facade.clearTotals();
    this.facade.load('missing-acquirer', query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<ConciliationWaitingAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.load('missing-acquirer', query);
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
    const authorization = this.authorization();

    const grossValueEnd = this.grossValueEnd();
    const liquidValueEnd = this.liquidValueEnd();
    const grossValueStart = this.grossValueStart();
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
        label: this.i18n.tUi('transactions.fields.saleDate'),
        value: saleDateValue,
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

  protected override applyFiltersState(s: ConciliationWaitingFiltersState): void {
    this.tid.set(s.tid ?? '');
    this.cvNsu.set(s.cvNsu ?? '');
    this.authorization.set(s.authorization ?? '');

    this.grossValueEnd.set(s.grossValueEnd ?? null);
    this.liquidValueEnd.set(s.liquidValueEnd ?? null);
    this.grossValueStart.set(s.grossValueStart ?? null);
    this.liquidValueStart.set(s.liquidValueStart ?? null);

    this.flags.set(s.flags ?? null);
    this.capture.set(s.capture ?? null);
    this.modality.set(s.modality ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate ?? null);
  }

  protected override buildAdvancedFilters(): Partial<ConciliationWaitingAdvancedFilters> {
    const grossValueEnd = this.grossValueEnd();
    const liquidValueEnd = this.liquidValueEnd();
    const grossValueStart = this.grossValueStart();
    const liquidValueStart = this.liquidValueStart();

    return {
      tid: this.tid().trim() || undefined,
      cvNsu: this.cvNsu().trim() || undefined,
      authorization: this.authorization().trim() || undefined,

      grossValueEnd: grossValueEnd ?? undefined,
      liquidValueEnd: liquidValueEnd ?? undefined,
      grossValueStart: grossValueStart ?? undefined,
      liquidValueStart: liquidValueStart ?? undefined,

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

    const grossValue = this.moneyFilterLabel(filters, 'grossValue');
    if (grossValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.grossValue'),
        value: grossValue,
      });
    }

    const liquidValue = this.moneyFilterLabel(filters, 'liquidValue');
    if (liquidValue) {
      items.push({
        label: this.i18n.tUi('transactions.fields.liquid'),
        value: liquidValue,
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

  protected override toFiltersState(): ConciliationWaitingFiltersState {
    return {
      tid: this.tid(),
      cvNsu: this.cvNsu(),
      capture: this.capture(),
      authorization: this.authorization(),

      grossValueEnd: this.grossValueEnd(),
      liquidValueEnd: this.liquidValueEnd(),
      grossValueStart: this.grossValueStart(),
      liquidValueStart: this.liquidValueStart(),

      flags: this.flags(),
      modality: this.modality(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),
    };
  }

  protected onGrossValueRangeChange(value: CsCurrencyRangeValue): void {
    this.grossValueStart.set(value.start ?? null);
    this.grossValueEnd.set(value.end ?? null);
  }

  protected onLiquidValueRangeChange(value: CsCurrencyRangeValue): void {
    this.liquidValueStart.set(value.start ?? null);
    this.liquidValueEnd.set(value.end ?? null);
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
      'cvNsu',
      this.cvNsuColumnDraft,
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
      'authorization',
      this.authorizationColumnDraft,
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
      'statusTransactionReason',
      this.statusTransactionReasonColumnDraft,
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
      'acquirer',
      this.acquirerColumnDraft,
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

  protected loading() {
    return this.facade.loading();
  }

  protected canMarkErpAsDeleted(row: ConciliationWaitingModel | null | undefined): boolean {
    return !!this.transactionId(row);
  }

  protected canEditIdentity(row: ConciliationWaitingModel | null | undefined): boolean {
    return !!this.transactionId(row) && row?.capture === CaptureEnum.MANUAL;
  }

  protected isRowSelected(row: ConciliationWaitingModel): boolean {
    const id = this.transactionId(row);
    return !!id && this.selectedRows().some((item) => this.transactionId(item) === id);
  }

  protected isRowCheckboxDisabled(row: ConciliationWaitingModel): boolean {
    return !this.canMarkErpAsDeleted(row);
  }

  protected toggleRowSelection(row: ConciliationWaitingModel, checked: boolean): void {
    const id = this.transactionId(row);
    if (!id) return;

    const current = this.selectedRows();

    if (!checked) {
      this.selectedRows.set(current.filter((item) => this.transactionId(item) !== id));
      return;
    }

    if (this.isRowCheckboxDisabled(row) || this.isRowSelected(row)) {
      return;
    }

    this.selectedRows.set([...current, row]);
  }

  protected toggleHeaderSelection(checked: boolean): void {
    const eligible = this.headerEligibleRows();

    if (!checked) {
      this.selectedRows.set([]);
      return;
    }

    this.selectedRows.set([...eligible]);
  }

  protected openBatchDialog(): void {
    const rows = this.selectedDeleteRows();

    if (!rows.length) {
      this.toast.warn(
        this.i18n.tUi('conciliation.noEligibleSelectedTitle'),
        this.i18n.tUi('conciliation.missingAcq.batch.noEligibleSelectedDetail'),
      );
      return;
    }

    this.pendingBatchAction.set('MARK_ERP_DELETED');
    this.batchDialogVisible.set(true);
  }

  protected closeBatchDialog(): void {
    if (this.resolving()) return;

    this.batchDialogVisible.set(false);
    this.pendingBatchAction.set(null);
  }

  protected confirmBatchAction(_payload?: any): void {
    // handled by confirmBatchDeleteAction for delete; this path covers other batch actions
    this.batchDialogVisible.set(false);
  }

  protected confirmDeleteErp(row: ConciliationWaitingModel): void {
    const erpId = this.transactionId(row);

    if (!erpId) {
      this.toast.warn(
        this.i18n.tUi('conciliation.missingAcq.single.erpNotFoundTitle'),
        this.i18n.tUi('conciliation.missingAcq.single.erpNotFoundDetail'),
      );
      return;
    }

    this.pendingConfirmAction.set('MARK_ERP_DELETED_SINGLE');
    this.pendingConfirmRow.set(row);
    this.actionDialogVisible.set(true);
  }

  protected closeActionDialog(): void {
    if (this.resolving()) return;

    this.actionDialogVisible.set(false);
    this.pendingConfirmAction.set(null);
    this.pendingConfirmRow.set(null);
  }

  protected confirmAction(_payload?: any): void {
    // handled by confirmSingleDeleteAction for delete; this path covers other actions (create, reconcile)
    this.actionDialogVisible.set(false);
  }

  protected confirmSingleDeleteAction(payload: DeleteErpConfirmPayload): void {
    const row = this.pendingConfirmRow();
    const erpId = this.transactionId(row);

    if (!row || !erpId || this.resolving()) {
      return;
    }

    this.actionDialogVisible.set(false);
    this.markErpAsDeleted(erpId, payload.reason, payload.observations);
  }

  protected confirmBatchDeleteAction(payload: DeleteErpConfirmPayload): void {
    if (this.resolving()) return;

    const ids = this.selectedDeleteRows()
      .map((row) => this.transactionId(row))
      .filter((id): id is string => !!id);

    if (!ids.length) {
      this.closeBatchDialog();
      return;
    }

    this.resolving.set(true);

    this.facade
      .markErpAsDeletedBatch(ids, payload.reason, payload.observations)
      .pipe(finalize(() => this.resolving.set(false)))
      .subscribe({
        next: (result) => this.handleBatchSuccess(result),
        error: () => {
          this.toast.error(
            this.i18n.tUi('conciliation.errorTitle'),
            this.i18n.tUi('conciliation.missingAcq.batch.deleteErrorDetail'),
          );
        },
      });
  }

  protected batchDescription(): string {
    return this.i18n.tUi('conciliation.missingAcq.batch.description');
  }

  protected batchActionSuffix(): string {
    return this.i18n.tUi('conciliation.missingAcq.batch.actionSuffix');
  }

  protected batchConfirmLabel(): string {
    return this.i18n.tUi('conciliation.missingAcq.batch.confirmLabel');
  }

  protected confirmActionDescription(): string {
    return this.i18n.tUi('conciliation.missingAcq.single.description');
  }

  protected confirmActionSuffix(): string {
    return this.i18n.tUi('conciliation.missingAcq.single.actionSuffix');
  }

  protected confirmActionGrossTotal(): number {
    return this.numericValue(this.pendingConfirmRow()?.grossValue);
  }

  protected confirmActionLiquidTotal(): number {
    return this.numericValue(this.pendingConfirmRow()?.liquidValue);
  }

  protected confirmActionLabel(): string {
    return this.i18n.tUi('conciliation.missingErp.single.confirmLabel');
  }

  protected confirmActionButtonClass(): string {
    return 'p-button-danger';
  }

  protected openEditIdentityDialog(row: ConciliationWaitingModel): void {
    if (!this.canEditIdentity(row)) return;
    this.pendingEditRow.set(row);
    this.editIdentityDialogVisible.set(true);
  }

  protected closeEditIdentityDialog(): void {
    if (this.resolving()) return;
    this.editIdentityDialogVisible.set(false);
    this.pendingEditRow.set(null);
  }

  protected confirmEditIdentity(payload: ErpEditIdentityPayload): void {
    const row = this.pendingEditRow();
    const erpId = this.transactionId(row);

    if (!row || !erpId || this.resolving()) return;

    this.editIdentityDialogVisible.set(false);
    this.resolving.set(true);

    this.facade
      .updateErpIdentity(erpId, { nsu: payload.nsu, authorization: payload.authorization })
      .pipe(finalize(() => this.resolving.set(false)))
      .subscribe({
        next: () => {
          this.pendingEditRow.set(null);
          this.reloadWithCurrentState();
          this.toast.success(
            this.i18n.tUi('conciliation.missingAcq.editIdentity.successTitle'),
            this.i18n.tUi('conciliation.missingAcq.editIdentity.successDetail'),
          );
        },
        error: () => {
          this.toast.error(
            this.i18n.tUi('conciliation.missingAcq.editIdentity.errorTitle'),
            this.i18n.tUi('conciliation.missingAcq.editIdentity.errorDetail'),
          );
        },
      });
  }

  private markErpAsDeleted(erpTransactionId: string, reason: string, observations: string): void {
    if (this.resolving()) return;

    this.resolving.set(true);

    this.facade
      .markErpAsDeleted(erpTransactionId, reason, observations)
      .pipe(finalize(() => this.resolving.set(false)))
      .subscribe({
        next: (result) => this.handleResolutionSuccess(result),
        error: () => {
          this.toast.error(
            this.i18n.tUi('conciliation.missingAcq.single.deleteErrorTitle'),
            this.i18n.tUi('conciliation.missingAcq.single.deleteErrorDetail'),
          );
        },
      });
  }

  private handleResolutionSuccess(result: ErpAcquirerResolutionResultModel): void {
    this.pendingConfirmRow.set(null);
    this.pendingConfirmAction.set(null);
    this.selectedRows.set([]);
    this.facade.clearTotals();
    this.reloadWithCurrentState();

    this.toast.success(
      this.i18n.tUi('conciliation.missingAcq.single.deleteTitle'),
      result?.message || this.i18n.tUi('conciliation.missingAcq.single.deleteDetail'),
      7000,
    );
  }

  private handleBatchSuccess(result: ErpAcquirerBatchResolutionResultModel): void {
    this.batchDialogVisible.set(false);
    this.pendingBatchAction.set(null);
    this.selectedRows.set([]);
    this.facade.clearTotals();
    this.reloadWithCurrentState();

    const title =
      result.failed > 0
        ? this.i18n.tUi('conciliation.finishedWithWarningsTitle')
        : this.i18n.tUi('conciliation.finishedTitle');

    const message = this.i18n.tUi('conciliation.finishedMessage', {
      success: this.number(result.success),
      failed: this.number(result.failed),
      requested: this.number(result.requested),
    });

    if (result.failed > 0) {
      this.toast.warn(title, message, 9000);
      return;
    }

    this.toast.success(title, message, 7000);
  }

  private transactionId(row: ConciliationWaitingModel | null | undefined): string | null {
    const raw = row as
      | (ConciliationWaitingModel & {
          erpTransactionId?: string | null;
          transactionErpId?: string | null;
          transactionErpSaleId?: string | null;
          erpId?: string | null;
        })
      | null
      | undefined;

    return (
      raw?.erpTransactionId ??
      raw?.transactionErpId ??
      raw?.transactionErpSaleId ??
      raw?.erpId ??
      raw?.id ??
      null
    );
  }

  private numericValue(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private number(value: number | null | undefined): string {
    return new Intl.NumberFormat(this.i18n.getAppliedLang() || 'pt-BR').format(value ?? 0);
  }
}
