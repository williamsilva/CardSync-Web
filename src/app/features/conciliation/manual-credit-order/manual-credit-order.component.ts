import { FormsModule } from '@angular/forms';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelect } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { TranslateModule } from '@ngx-translate/core';

import { Card } from 'primeng/card';
import { I18nService } from '@core/i18n/i18n.service';
import { CsTagComponent, CsTagTone } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { SaleSummaryApiModel } from '@features/models/sales-summary.model';
import { CreditOrderManualResult } from '@features/models/credit-order.model';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { SaleSummaryAdvancedFilters } from '@features/filter/sale-summary.filters';
import { CreditOrderApiService } from '@features/service/credit-order.api.service';
import { ManualCreditOrderFacade } from '@features/facade/manual-credit-order.facade';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';
import {
  ManualCreditOrderFiltersState,
  resetManualCreditOrderFilters,
  createEmptyManualCreditOrderFiltersState,
} from '@features/filter/manual-credit-order.filters';
import {
  readArrayFilterValues,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ModalityEnum,
  allModalityEnum,
  modalityEnumLabel,
  modalityEnumSeverity,
} from '@models/enums/modality.enum';
import {
  StatusReconciliationEnum,
  statusReconciliationEnumLabel,
  statusReconciliationEnumSeverity,
  allStatusReconciliationManualCreditEnum,
} from '@models/enums/status-reconciliation.enum';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'cs-manual-credit-order',
  styleUrl: './manual-credit-order.component.scss',
  templateUrl: './manual-credit-order.component.html',
  imports: [
    FormsModule,
    Card,
    CsDatePipe,
    MultiSelect,
    TableModule,
    ButtonModule,
    TooltipModule,
    CheckboxModule,
    CsTagComponent,
    CsDocumentPipe,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class ManualCreditOrderComponent
  extends StatefulListPage<ManualCreditOrderFiltersState, SaleSummaryAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly toast = inject(MessageService);
  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly facade = inject(ManualCreditOrderFacade);
  readonly creditOrderService = inject(CreditOrderApiService);

  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.activeOptions;
  readonly acquirersOptions = this.acquirerFacade.activeOptions;

  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  /* Seleção de linhas */
  readonly saving = signal(false);
  readonly creatingId = signal<string | null>(null);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly lastResult = signal<CreditOrderManualResult | null>(null);

  /* Filtros avançados */
  readonly rvNumber = signal('');
  readonly flags = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly modality = signal<ModalityEnum[] | null>(null);
  readonly creditOrderStatus = signal<StatusReconciliationEnum[] | null>(null);

  /* Filtros de coluna (drafts) */
  readonly rvNumberColumnDraft = signal('');
  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly modalityColumnDraft = signal<ModalityEnum[] | null>(null);
  readonly creditOrderStatusColumnDraft = signal<StatusReconciliationEnum[] | null>(null);

  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly tableRows = computed<SaleSummaryApiModel[]>(() => this.facade.rows());

  readonly headerChecked = computed(
    () =>
      this.tableRows().length > 0 && this.tableRows().every((r) => this.selectedIds().has(r.id)),
  );

  readonly headerIndeterminate = computed(() => {
    const n = this.tableRows().filter((r) => this.selectedIds().has(r.id)).length;
    return n > 0 && n < this.tableRows().length;
  });

  readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly statusReconciliationOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allStatusReconciliationManualCreditEnum().map((value) => ({
      label: statusReconciliationEnumLabel(value, this.i18n),
      value,
    }));
  });

  ngOnInit(): void {
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncColumnDraftsFromTableState());
  }

  isRowSelected(row: SaleSummaryApiModel): boolean {
    return this.selectedIds().has(row.id);
  }

  toggleRowSelection(row: SaleSummaryApiModel, checked: boolean): void {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      checked ? next.add(row.id) : next.delete(row.id);
      return next;
    });
  }

  toggleHeaderSelection(checked: boolean): void {
    this.selectedIds.update((ids) => {
      const next = new Set(ids);
      this.tableRows().forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  }

  statusEnumLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
  }

  statusReconciliationLabel(value: StatusReconciliationEnum | null): string {
    return statusReconciliationEnumLabel(value, this.i18n);
  }

  statusReconciliationSeverity(value: StatusReconciliationEnum | null): CsTagTone {
    return statusReconciliationEnumSeverity(value);
  }

  modalityLabel(value: ModalityEnum | null): string {
    return modalityEnumLabel(value, this.i18n);
  }

  modalitySeverity(value: ModalityEnum | null): CsTagTone {
    return modalityEnumSeverity(value);
  }

  createSingle(row: SaleSummaryApiModel): void {
    this.creatingId.set(row.id);
    this.creditOrderService.createManual({ summaryIds: [row.id] }).subscribe({
      next: (result) => {
        this.creatingId.set(null);
        this.selectedIds.update((ids) => {
          const next = new Set(ids);
          next.delete(row.id);
          return next;
        });
        this.facade.reloadLast();
        this.toast.add({
          severity: result.created > 0 ? 'success' : 'warn',
          summary: this.i18n.tUi(result.created > 0 ? 'common.success' : 'common.warning'),
          detail: this.i18n.tUi('conciliation.manualCreditOrder.saved', {
            created: result.created,
            skipped: result.skipped,
          }),
        });
      },
      error: () => this.creatingId.set(null),
    });
  }

  createSelected(): void {
    if (this.selectedCount() === 0) return;

    this.saving.set(true);
    this.lastResult.set(null);
    const ids = Array.from(this.selectedIds());

    this.creditOrderService.createManual({ summaryIds: ids }).subscribe({
      next: (result) => {
        this.lastResult.set(result);
        this.selectedIds.set(new Set());
        this.saving.set(false);
        this.facade.reloadLast();
        this.toast.add({
          severity: result.created > 0 ? 'success' : 'warn',
          summary: this.i18n.tUi(result.created > 0 ? 'common.success' : 'common.warning'),
          detail: this.i18n.tUi('conciliation.manualCreditOrder.saved', {
            created: result.created,
            skipped: result.skipped,
          }),
        });
      },
      error: () => this.saving.set(false),
    });
  }

  clear(): void {
    localStorage.removeItem(this.tableStateKey());
    sessionStorage.removeItem(this.tableStateKey());
    this.lastResult.set(null);
    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  /* StatefulListPage abstracts */
  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_CREDIT_ORDER.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_CREDIT_ORDER.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.CONCILIATION.MANUAL_CREDIT_ORDER.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<SaleSummaryAdvancedFilters>>,
  ): void {
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
    resetManualCreditOrderFilters(this);
  }

  protected override toFiltersState(): ManualCreditOrderFiltersState {
    return {
      rvNumber: this.rvNumber(),
      companies: this.companies(),
      flags: this.flags(),
      acquirers: this.acquirers(),
      modality: this.modality(),
      creditOrderStatus: this.creditOrderStatus(),
    };
  }

  protected override applyFiltersState(s: ManualCreditOrderFiltersState): void {
    this.rvNumber.set(s.rvNumber ?? '');
    this.companies.set(s.companies ?? null);
    this.flags.set(s.flags ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.modality.set(s.modality ?? null);
    this.creditOrderStatus.set(s.creditOrderStatus ?? null);
  }

  protected override buildAdvancedFilters(): Partial<SaleSummaryAdvancedFilters> {
    return {
      rvNumber: this.rvNumber() || undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      flags: this.flags()?.length ? this.flags()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      modality: this.modality()?.length ? this.modality()! : undefined,
      creditOrderStatus: this.creditOrderStatus()?.length ? this.creditOrderStatus()! : undefined,
    };
  }

  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const rvNumber = this.rvNumber();
    if (rvNumber) {
      items.push({ label: this.i18n.tUi('saleSummary.fields.rvNumber'), value: rvNumber });
    }

    const company = this.companies();
    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('saleSummary.fields.company'), value: labels });
    }

    const flag = this.flags();
    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('saleSummary.fields.flag'), value: labels });
    }

    const acquirer = this.acquirers();
    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('saleSummary.fields.acquirer'), value: labels });
    }

    const modality = this.modality();
    if (modality?.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.modality'),
        value: modality.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const creditOrderStatus = this.creditOrderStatus();
    if (creditOrderStatus?.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.creditOrderStatusEnum'),
        value: creditOrderStatus.map((v) => statusReconciliationEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((opt) => companies.includes(opt.id))
        .map((opt) => opt.fantasyName);
      items.push({
        label: this.i18n.tUi('saleSummary.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirers.includes(opt.id))
        .map((opt) => opt.fantasyName);
      items.push({
        label: this.i18n.tUi('saleSummary.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flags.includes(opt.id))
        .map((opt) => opt.name);
      items.push({
        label: this.i18n.tUi('saleSummary.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const modalities = readArrayFilterValues(filters, 'modality');
    if (modalities.length) {
      items.push({
        label: this.i18n.tUi('saleSummary.fields.modality'),
        value: modalities.map((v) => modalityEnumLabel(v as ModalityEnum, this.i18n)).join(', '),
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

    const rvNumber = readSingleFilterValue(filters, 'rvNumber');
    if (rvNumber) {
      items.push({ label: this.i18n.tUi('saleSummary.fields.rvNumber'), value: rvNumber });
    }

    return items;
  }

  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

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
    this.syncArrayColumnDraftFromTableState(
      filters,
      'modality',
      this.modalityColumnDraft,
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
      'rvNumber',
      this.rvNumberColumnDraft,
      readSingleFilterValue,
    );
  }

  protected emptyFiltersState(): ManualCreditOrderFiltersState {
    return createEmptyManualCreditOrderFiltersState();
  }
}
