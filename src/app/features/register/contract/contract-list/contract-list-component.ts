import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, computed, inject, signal } from '@angular/core';

import { Table } from 'primeng/table';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { UsersFacade } from '@features/facade/users.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { ContractFacade } from '@features/facade/contract.facade';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { ContractAdvancedFilters } from '@features/filter/contract.filters';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { ContractFiltersState, ContractModel } from '@models/contract.models';
import { BulkActionListPage } from '@features/list-base/bulk-action-list-page';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ContractCreateDialogComponent } from '../contract-create/contract-create-dialog';
import { SelectableStatefulListPage } from '@features/list-base/selectable-stateful-list-page';
import { CsSelectionHeaderComponent } from '@features/list-base/cs-selection-header.component';
import { CsRowActionButtonComponent } from '@features/list-base/cs-row-action-button.component';
import { ContractPermissionPolicy } from '@features/security/policy/contract-permission.policy';
import { CsTableColumnHeaderComponent } from '@features/list-base/cs-table-column-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { ContractViewDialogComponent } from '../contract-view-dialog/contract-view-dialog.component';
import { CsColumnFilterTemplateDirective } from '@features/list-base/cs-column-filter-template.directive';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  readArrayFilterValues,
  readPeriodFilterValue,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ContractEnum,
  allContractEnum,
  contractEnumLabel,
  contractEnumSeverity,
} from '@models/enums/contract.enum';
import {
  TypeEstablishmentEnum,
  typeEstablishmentEnumLabel,
  typeEstablishmentEnumSeverity,
} from '@models/enums/type-establishment.enum';

@Component({
  standalone: true,
  selector: 'app-contract-list',
  templateUrl: './contract-list-component.html',
  imports: [
    CommonModule,
    FloatLabel,
    CsDatePipe,
    FormsModule,
    TableModule,
    SelectModule,
    ButtonModule,
    TooltipModule,
    CsDocumentPipe,
    CheckboxModule,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    DatePickerModule,
    MultiSelectModule,
    ConfirmDialogModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsRowActionButtonComponent,
    CsSelectionHeaderComponent,
    ContractViewDialogComponent,
    CsColumnFilterShellComponent,
    CsTableColumnHeaderComponent,
    CsAdvancedTextFilterComponent,
    ContractCreateDialogComponent,
    CsColumnFilterTemplateDirective,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class ContractListComponent
  extends SelectableStatefulListPage<
    ContractModel,
    ContractEnum,
    ContractFiltersState,
    ContractAdvancedFilters
  >
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);
  readonly userFacade = inject(UsersFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly facadeContract = inject(ContractFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  protected readonly toast = inject(MessageService);
  protected readonly confirm = inject(ConfirmationService);
  protected override readonly secPolicy = inject(ContractPermissionPolicy);

  readonly usersOptions = this.userFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

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

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  readonly description = signal('');

  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly contractEnum = signal<ContractEnum[] | null>(null);

  readonly createdAt = signal<string[] | null>(null);
  readonly createdBy = signal<string[] | null>(null);
  readonly periodEndDate = signal<PeriodEnum | null>(null);
  readonly endDate = signal<string | string[] | null>(null);
  readonly periodStartDate = signal<PeriodEnum | null>(null);
  readonly startDate = signal<string | string[] | null>(null);

  /**
   * Drafts dos filtros da tabela.
   * A seleção não busca automaticamente; só aplica ao clicar em Aplicar.
   */
  readonly descriptionColumnDraft = signal('');
  readonly statusColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly createdByColumnDraft = signal<string[] | null>(null);
  readonly createdAtColumnPeriod = signal<PeriodEnum | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);
  readonly createdAtColumnDraft = signal<string | string[] | null>(null);

  readonly viewVisible = signal(false);
  readonly upsertVisible = signal(false);
  readonly contract = signal<ContractModel | null>(null);
  readonly viewContract = signal<ContractModel | null>(null);

  readonly totalRecords = computed(() => this.facadeContract.totalRecords());

  readonly contracts = computed<ContractModel[]>(
    () => this.facadeContract.contract() as ContractModel[],
  );

  protected override currentRows(): ContractModel[] {
    return this.contracts();
  }

  readonly isEndDateDisabled = computed(() => !this.periodEndDate());
  readonly isStartDateDisabled = computed(() => !this.periodStartDate());
  readonly isCreatedAtColumnDisabled = computed(() => !this.createdAtColumnPeriod());

  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();

    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusEnumOptions = computed(() => {
    this.i18n.getAppliedLang();

    return allContractEnum().map((value) => ({
      label: contractEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly canValiditySelected = computed(() => {
    const status = this.selectionStatus();

    return (
      (status === ContractEnum.EXPIRED || status === ContractEnum.CLOSED) &&
      this.secPolicy.canValidityBulk(this.selectedRows())
    );
  });

  readonly canExpiredSelected = computed(() => {
    const status = this.selectionStatus();

    return status === ContractEnum.VALIDITY && this.secPolicy.canExpiredBulk(this.selectedRows());
  });

  readonly canClosedSelected = computed(() => {
    const status = this.selectionStatus();

    return status === ContractEnum.VALIDITY && this.secPolicy.canClosedBulk(this.selectedRows());
  });

  readonly selectionModeLabel = computed(() => {
    const status = this.selectionStatus();

    if (status === ContractEnum.VALIDITY) {
      return this.i18n.tUi('enum.contractEnum.validity');
    }

    if (status === ContractEnum.EXPIRED) {
      return this.i18n.tUi('enum.contractEnum.expired');
    }

    if (status === ContractEnum.CLOSED) {
      return this.i18n.tUi('enum.contractEnum.closed');
    }

    return this.i18n.tUi('contract.selection.mode.none');
  });

  ngOnInit() {
    this.userFacade.loadUsersOptionsFilter();
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

  clear() {
    this.clearSelection();
    this.resetFilters();
    this.descriptionColumnDraft.set('');

    this.statusColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.createdAtColumnDraft.set(null);
    this.createdByColumnDraft.set(null);
    this.createdAtColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  onPeriodEndDateChange(period: PeriodEnum | null): void {
    this.periodEndDate.set(period);
    this.endDate.set(null);
  }

  onPeriodStartDateChange(period: PeriodEnum | null): void {
    this.periodStartDate.set(period);
    this.startDate.set(null);
  }

  statusLabel(status: ContractEnum | null) {
    return contractEnumLabel(status, this.i18n);
  }

  statusSeverity(status: ContractEnum | null) {
    return contractEnumSeverity(status);
  }

  typeEstablishmentEnumLabel(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumLabel(status, this.i18n);
  }

  severityTypeEstablishmentEnum(status: TypeEstablishmentEnum | null) {
    return typeEstablishmentEnumSeverity(status);
  }

  validity(row: ContractModel): void {
    this.bulk.executeAction(
      this.facadeContract.validity(row.id),
      this.i18n.tUi('contract.validity.successSingle'),
    );
  }

  expired(row: ContractModel): void {
    this.bulk.executeAction(
      this.facadeContract.expired(row.id),
      this.i18n.tUi('contract.expired.successSingle'),
    );
  }

  closed(row: ContractModel): void {
    this.bulk.executeAction(
      this.facadeContract.closed(row.id),
      this.i18n.tUi('contract.closed.successSingle'),
    );
  }

  confirmValidity(row: ContractModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.validity.header'),
      message: this.i18n.tUi('contract.validity.messageSingle', {
        description: row?.description ?? row?.id ?? '',
      }),
      icon: 'pi pi-check-circle',
      accept: () => this.validity(row),
    });
  }

  confirmExpired(row: ContractModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.expired.header'),
      message: this.i18n.tUi('contract.expired.messageSingle', {
        description: row?.description ?? row?.id ?? '',
      }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.expired(row),
    });
  }

  confirmClosed(row: ContractModel): void {
    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.closed.header'),
      message: this.i18n.tUi('contract.closed.messageSingle', {
        description: row?.description ?? row?.id ?? '',
      }),
      icon: 'pi pi-lock',
      accept: () => this.closed(row),
    });
  }

  confirmValiditySelected(): void {
    const rows = this.selectedRows();

    if (!rows.length) {
      return;
    }

    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.validity.header'),
      message: this.i18n.tUi('contract.validity.messageBulk', { count: rows.length }),
      icon: 'pi pi-check-circle',
      accept: () => this.validitySelected(),
    });
  }

  confirmExpiredSelected(): void {
    const rows = this.selectedRows();

    if (!rows.length) {
      return;
    }

    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.expired.header'),
      message: this.i18n.tUi('contract.expired.messageBulk', { count: rows.length }),
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.expiredSelected(),
    });
  }

  confirmClosedSelected(): void {
    const rows = this.selectedRows();

    if (!rows.length) {
      return;
    }

    this.bulk.confirmAction({
      header: this.i18n.tUi('contract.closed.header'),
      message: this.i18n.tUi('contract.closed.messageBulk', { count: rows.length }),
      icon: 'pi pi-lock',
      accept: () => this.closedSelected(),
    });
  }

  validitySelected(): void {
    const rows = this.selectedRows();

    if (!rows.length) {
      return;
    }

    this.bulk.executeAction(
      this.facadeContract.validityBulk(rows.map((row) => row.id)),
      this.i18n.tUi('contract.validity.successBulk', { count: rows.length }),
    );
  }

  expiredSelected(): void {
    const rows = this.selectedRows();

    if (!rows.length) {
      return;
    }

    this.bulk.executeAction(
      this.facadeContract.expiredBulk(rows.map((row) => row.id)),
      this.i18n.tUi('contract.expired.successBulk', { count: rows.length }),
    );
  }

  closedSelected(): void {
    const rows = this.selectedRows();

    if (!rows.length) {
      return;
    }

    this.bulk.executeAction(
      this.facadeContract.closedBulk(rows.map((row) => row.id)),
      this.i18n.tUi('contract.closed.successBulk', { count: rows.length }),
    );
  }

  onCreated() {
    this.reloadWithCurrentState();
  }

  goNew() {
    if (!this.secPolicy.canCreate()) {
      return;
    }

    this.contract.set(null);
    this.upsertVisible.set(true);
  }

  edit(row: ContractModel) {
    if (!this.secPolicy.canEdit(row)) {
      return;
    }

    this.contract.set(row);
    this.upsertVisible.set(true);
  }

  view(row: ContractModel) {
    this.viewContract.set(row);
    this.viewVisible.set(true);
  }

  onViewVisibleChange(value: boolean) {
    this.viewVisible.set(value);

    if (!value) {
      this.viewContract.set(null);
    }
  }

  onSaved() {
    this.upsertVisible.set(false);
    this.contract.set(null);
    this.facadeContract.reloadLast();
  }

  onUpsertVisibleChange(value: boolean) {
    this.upsertVisible.set(value);

    if (!value) {
      this.contract.set(null);
    }
  }

  createdAtFilterLabel(value: unknown): string {
    const filterValue = value as { period?: PeriodEnum; value?: string | string[] } | null;

    if (!filterValue?.period || !filterValue.value) {
      return '';
    }

    const periodLabel = periodEnumLabel(filterValue.period, this.i18n);
    const dateLabel = Array.isArray(filterValue.value)
      ? filterValue.value.filter(Boolean).join(' - ')
      : filterValue.value;

    return `${periodLabel}: ${dateLabel}`;
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;

    if (!filters) {
      return;
    }

    this.syncTextColumnDraftFromTableState(
      filters,
      'description',
      this.descriptionColumnDraft,
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

    const establishments = readArrayFilterValues(filters, 'establishment');
    this.establishmentColumnDraft.set(establishments.length ? establishments : null);

    this.syncArrayColumnDraftFromTableState(
      filters,
      'statusEnum',
      this.statusColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'createdBy',
      this.createdByColumnDraft,
      readArrayFilterValues,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'createdAt',
      this.createdAtColumnPeriod,
      this.createdAtColumnDraft,
      readPeriodFilterValue,
    );
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

  protected override loadFirstPage() {
    const tableQuery = { page: 0, size: this.rows };
    const query = buildListQuery<ContractAdvancedFilters>(
      tableQuery as any,
      this.buildAdvancedFilters(),
    );

    this.clearSelection();
    this.facadeContract.loadPage(query);
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const acquirers = this.acquirers();
    const createdBy = this.createdBy();
    const companies = this.companies();
    const contractEnum = this.contractEnum();
    const establishments = this.establishments();
    const description = this.description().trim();

    const startDate = this.startDate();
    const periodStartDate = this.periodStartDate();

    const endDate = this.endDate();
    const periodEndDate = this.periodEndDate();

    if (description) {
      items.push({
        label: this.i18n.tUi('contract.fields.description'),
        value: description,
      });
    }

    if (contractEnum?.length) {
      items.push({
        label: this.i18n.tUi('contract.fields.contractEnum'),
        value: contractEnum.map((v) => contractEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (periodStartDate) {
      items.push({
        label: this.i18n.tUi('contract.fields.periodStartDate'),
        value: periodEnumLabel(periodStartDate, this.i18n),
      });
    }

    if (createdBy?.length) {
      const labels = this.usersOptions()
        .filter((opt) => createdBy.includes(opt.value))
        .map((opt) => opt.label)
        .join(', ');

      items.push({
        label: this.i18n.tUi('contract.fields.createdBy'),
        value: labels,
      });
    }

    if (startDate) {
      items.push({
        label: this.i18n.tUi('contract.fields.startDate'),
        value: Array.isArray(startDate) ? startDate.join(' - ') : startDate,
      });
    }

    if (periodEndDate) {
      items.push({
        label: this.i18n.tUi('contract.fields.periodEndDate'),
        value: periodEnumLabel(periodEndDate, this.i18n),
      });
    }

    if (endDate) {
      items.push({
        label: this.i18n.tUi('contract.fields.endDate'),
        value: Array.isArray(endDate) ? endDate.join(' - ') : endDate,
      });
    }

    if (companies?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => companies.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('contract.fields.company'),
        value: labels,
      });
    }

    if (acquirers?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirers.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');

      items.push({
        label: this.i18n.tUi('contract.fields.acquirer'),
        value: labels,
      });
    }

    if (establishments?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishments.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');

      items.push({
        label: this.i18n.tUi('contract.fields.establishment'),
        value: labels,
      });
    }

    return items;
  });

  protected override resetFilters(): void {
    this.description.set('');

    this.createdBy.set(null);
    this.companies.set(null);
    this.acquirers.set(null);
    this.establishments.set(null);

    this.contractEnum.set(null);

    this.createdAt.set(null);

    this.startDate.set(null);
    this.periodStartDate.set(null);

    this.endDate.set(null);
    this.periodEndDate.set(null);
  }

  protected override toFiltersState(): ContractFiltersState {
    return {
      createdAt: this.createdAt(),

      description: this.description(),
      createdBy: this.createdBy()?.length ? this.createdBy() : null,
      company: this.companies()?.length ? this.companies() : null,
      acquirer: this.acquirers()?.length ? this.acquirers() : null,
      establishment: this.establishments()?.length ? this.establishments() : null,

      contractEnum: this.contractEnum()?.length ? this.contractEnum() : null,

      startDate: this.startDate(),
      periodStartDate: this.periodStartDate(),

      endDate: this.endDate(),
      periodEndDate: this.periodEndDate(),
    };
  }

  protected override applyFiltersState(s: ContractFiltersState): void {
    this.description.set(s.description ?? '');

    this.companies.set(s.company ?? null);
    this.acquirers.set(s.acquirer ?? null);
    this.createdBy.set(s.createdBy ?? null);
    this.establishments.set(s.establishment ?? null);

    this.contractEnum.set(s.contractEnum ?? null);

    this.createdAt.set(s.createdAt ?? null);

    this.startDate.set(s.startDate ?? null);
    this.periodStartDate.set(s.periodStartDate ?? null);

    this.endDate.set(s.endDate ?? null);
    this.periodEndDate.set(s.periodEndDate ?? null);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override buildAdvancedFilters(): Partial<ContractAdvancedFilters> {
    return {
      company: this.companies() || null,
      acquirer: this.acquirers() || null,
      establishment: this.establishments() || null,

      createdAt: this.createdAt() || null,
      createdBy: this.createdBy() || null,
      description: this.description().trim() || undefined,
      contractEnum: this.contractEnum()?.length ? this.contractEnum() : undefined,

      startDate: this.startDate() ?? undefined,
      periodStartDate: this.periodStartDate() ?? undefined,

      endDate: this.endDate() ?? undefined,
      periodEndDate: this.periodEndDate() ?? undefined,
    };
  }

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();

    const items: ActiveFilterItem[] = [];

    const description = readSingleFilterValue(filters, 'description');
    if (description) {
      items.push({
        label: this.i18n.tUi('contract.fields.description'),
        value: description,
      });
    }

    const companiesValues = readArrayFilterValues(filters, 'company');
    if (companiesValues.length) {
      const labels = this.companiesOptions()
        .filter((option) => companiesValues.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('contract.fields.company'),
        value: (labels.length ? labels : companiesValues).join(', '),
      });
    }

    const acquirersValues = readArrayFilterValues(filters, 'acquirer');
    if (acquirersValues.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirersValues.includes(option.id))
        .map((option) => option.fantasyName);

      items.push({
        label: this.i18n.tUi('contract.fields.acquirer'),
        value: (labels.length ? labels : acquirersValues).join(', '),
      });
    }

    const establishmentsValues = readArrayFilterValues(filters, 'establishment');
    if (establishmentsValues.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishmentsValues.includes(option.id))
        .map((option) => {
          const pvNumber = option.pvNumber ?? option.id;
          const acquirerName = option.acquirer?.fantasyName;
          const companyName = option.company?.fantasyName;

          const details = [acquirerName, companyName].filter(Boolean).join(' / ');

          return details ? `${pvNumber} (${details})` : pvNumber;
        });

      items.push({
        label: this.i18n.tUi('contract.fields.establishment'),
        value: (labels.length ? labels : establishmentsValues).join(', '),
      });
    }

    const statuses = readArrayFilterValues(filters, 'statusEnum');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('contract.fields.contractEnum'),
        value: statuses
          .map((value) => contractEnumLabel(value as ContractEnum, this.i18n))
          .join(', '),
      });
    }

    const createdAt = readPeriodFilterValue(filters, 'createdAt');
    if (createdAt?.period && createdAt.value) {
      items.push({
        label: this.i18n.tUi('contract.fields.createdAt'),
        value: this.createdAtFilterLabel(createdAt),
      });
    }

    const createdBy = readArrayFilterValues(filters, 'createdBy');
    if (createdBy.length) {
      const labels = this.usersOptions()
        .filter((option) => createdBy.includes(option.value))
        .map((option) => option.label);

      items.push({
        label: this.i18n.tUi('contract.fields.createdBy'),
        value: (labels.length ? labels : createdBy).join(', '),
      });
    }

    return items;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<ContractAdvancedFilters>>,
  ): void {
    this.clearSelection();
    this.facadeContract.loadPage(query);
  }
}
