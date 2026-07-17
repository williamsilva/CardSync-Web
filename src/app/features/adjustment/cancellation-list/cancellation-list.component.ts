import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelect } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberModule } from 'primeng/inputnumber';

import { CsTagTone, CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { AdjustmentCancellationModel } from '@models/adjustment-cancellation.model';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { AdjustmentCancellationFacade } from '@features/facade/adjustment-cancellation.facade';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';
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
  CancellationAdvancedFilters,
  resetCancellationAdvancedFilters,
  AdjustmentCancellationFiltersState,
  createEmptyAdjustmentCancellationFiltersState,
} from '@features/filter/adjustment-cancellation.filters';
import {
  AdjustmentReasonEnum,
  adjustmentReasonEnumLabel,
  adjustmentReasonEnumSeverity,
  allAdjustmentCancellationReasonEnum,
} from '@models/enums/adjustment-reason.enum';
import {
  AdjustmentStatusEnum,
  adjustmentStatusEnumLabel,
  adjustmentStatusEnumSeverity,
  allAdjustmentCancellationStatusEnum,
} from '@models/enums/adjustment-status.enum';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';

/**
 * Lista paginada de cancelamentos de vendas aplicados pela adquirente.
 *
 * Variante: Simples — somente busca e navegação cross-screen.
 * Endpoint: POST /v1/cancellations/search | /totals
 *
 * Filtros do painel (3 linhas):
 *   Linha 1 — Período/Data Venda · Período/Data Ajuste (Solicitação) · Período/Data Crédito · Autorização
 *   Linha 2 — CV/NSU · Adquirente · Bandeira · Range Valor Venda · Range Valor Ajuste
 *   Linha 3 — Empresa · Motivo Ajuste · Status
 *
 * Colunas da tabela (15):
 *   Empresa · ADQ · Bandeira · CV/NSU · PV Ajustado · RV Ajustado · Auto.
 *   Venda · Valor · Solici. · Ajuste (valor) · Crédito · Ajustes (motivo) · Status · Buscar
 */
@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-cancellation-list',
  templateUrl: './cancellation-list.component.html',
  imports: [
    CommonModule,
    Menu,
    Select,
    Tooltip,
    CsDatePipe,
    DatePicker,
    TableModule,
    MultiSelect,
    FormsModule,
    ButtonModule,
    CsDocumentPipe,
    CsCurrencyPipe,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    InputNumberModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsCurrencyRangeFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
    CsAdvancedFilterItemTemplateDirective,
  ],
})
export class CancellationListComponent
  extends StatefulListPage<AdjustmentCancellationFiltersState, CancellationAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(AdjustmentCancellationFacade);
  readonly router = inject(Router);
  readonly flagFacade = inject(FlagFacade);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly establishmentFacade = inject(EstablishmentFacade);

  /* Opções dos dropdowns de seleção */
  readonly flagsOptions = this.flagFacade.options;
  readonly companiesOptions = this.companyFacade.options;
  readonly acquirersOptions = this.acquirerFacade.options;
  readonly establishmentsOptions = this.establishmentFacade.options;

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly items = computed<AdjustmentCancellationModel[]>(
    () => this.facade.items() as AdjustmentCancellationModel[],
  );

  /* Restaura o tamanho de página da sessão anterior; cai no padrão se nao existir */
  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  /* Opções de enum reativas ao idioma — getAppliedLang() forca reavaliacao ao trocar lingua */
  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly adjustmentReasonOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allAdjustmentCancellationReasonEnum().map((value) => ({
      label: adjustmentReasonEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly adjustmentStatusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allAdjustmentCancellationStatusEnum().map((value) => ({
      label: adjustmentStatusEnumLabel(value, this.i18n),
      value,
    }));
  });

  /* Filtros avancados — painel lateral, persistidos em localStorage via filtersKey() */
  readonly flags = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly saleDate = signal<string | string[] | null>(null); // string[] quando range/mes
  readonly periodSaleDate = signal<PeriodEnum | null>(null);

  readonly adjustmentDate = signal<string | string[] | null>(null); // campo "Solicitacao" na UI
  readonly periodAdjustmentDate = signal<PeriodEnum | null>(null);

  readonly creditDate = signal<string | string[] | null>(null);
  readonly periodCreditDate = signal<PeriodEnum | null>(null);

  readonly cvNsu = signal<string>(''); // texto livre; '' -> omitido no payload
  readonly authorization = signal<string>(''); // texto livre; '' -> omitido no payload

  readonly valueStart = signal<number | null>(null); // range do valor da venda
  readonly valueEnd = signal<number | null>(null);
  readonly adjustmentValueStart = signal<number | null>(null); // range do valor do ajuste
  readonly adjustmentValueEnd = signal<number | null>(null);

  readonly adjustmentReason = signal<AdjustmentReasonEnum[] | null>(null);
  readonly status = signal<AdjustmentStatusEnum[] | null>(null);

  /* Datepicker so habilita quando o periodo esta selecionado */
  readonly isSaleDateDisabled = computed(() => !this.periodSaleDate());
  readonly isAdjustmentDateDisabled = computed(() => !this.periodAdjustmentDate());
  readonly isCreditDateDisabled = computed(() => !this.periodCreditDate());

  /* Objetos de range para o CsCurrencyRangeFilterComponent — une start+end num unico binding */
  readonly valueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.valueStart(),
    end: this.valueEnd(),
  }));

  readonly adjustmentValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.adjustmentValueStart(),
    end: this.adjustmentValueEnd(),
  }));

  /* Drafts colunas tabela — espelham os filtros inline da p-table, NAO persistidos separadamente.
     Inicializados a partir do estado salvo em ngAfterViewInit via syncColumnDraftsFromTableState. */

  readonly cvNsuColumnDraft = signal('');
  readonly rvNumberColumnDraft = signal('');
  readonly saleValueColumnDraft = signal('');
  readonly authorizationColumnDraft = signal('');
  readonly adjustmentValueColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);

  readonly saleDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly saleDateColumnDraft = signal<string | string[] | null>(null);

  readonly adjustmentDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly adjustmentDateColumnDraft = signal<string | string[] | null>(null);

  readonly creditDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly creditDateColumnDraft = signal<string | string[] | null>(null);

  readonly adjustmentReasonColumnDraft = signal<AdjustmentReasonEnum[] | null>(null);
  readonly statusColumnDraft = signal<AdjustmentStatusEnum[] | null>(null);

  readonly isSaleDateColumnDisabled = computed(() => !this.saleDateColumnPeriod());
  readonly isCreditDateColumnDisabled = computed(() => !this.creditDateColumnPeriod());
  readonly isAdjustmentDateColumnDisabled = computed(() => !this.adjustmentDateColumnPeriod());

  ngOnInit(): void {
    // Carrega opcoes dos filtros antes de initStatefulList, que pode restaurar
    // filtros salvos que dependem dessas listas para exibir os labels corretamente.
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();

    // Deve ser o ultimo — restaura estado da sessao anterior e dispara a primeira carga.
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    // queueMicrotask garante que os filtros da p-table ja foram inicializados pelo stateStorage
    // antes de tentarmos le-los para popular os sinais de draft das colunas.
    queueMicrotask(() => this.syncColumnDraftsFromTableState());
  }

  /** Limpa todos os filtros, o estado da tabela e recarrega a primeira pagina. */
  clear(): void {
    const key = this.tableStateKey();
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();

    this.cvNsuColumnDraft.set('');
    this.rvNumberColumnDraft.set('');
    this.saleValueColumnDraft.set('');
    this.authorizationColumnDraft.set('');
    this.adjustmentValueColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.statusColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
    this.saleDateColumnDraft.set(null);
    this.saleDateColumnPeriod.set(null);
    this.creditDateColumnDraft.set(null);
    this.creditDateColumnPeriod.set(null);
    this.establishmentColumnDraft.set(null);
    this.adjustmentDateColumnDraft.set(null);
    this.adjustmentDateColumnPeriod.set(null);
    this.adjustmentReasonColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  statusEnumLabel(value: StatusEnum | null): string {
    return statusEnumLabel(value, this.i18n);
  }

  statusEnumSeverity(value: StatusEnum | null): CsTagTone {
    return statusEnumSeverity(value);
  }

  adjustmentReasonLabel(value: AdjustmentReasonEnum | null): string {
    return adjustmentReasonEnumLabel(value, this.i18n);
  }

  adjustmentReasonSeverity(value: AdjustmentReasonEnum | null): CsTagTone {
    return adjustmentReasonEnumSeverity(value);
  }

  adjustmentStatusLabel(value: AdjustmentStatusEnum | null): string {
    return adjustmentStatusEnumLabel(value, this.i18n);
  }

  adjustmentStatusSeverity(value: AdjustmentStatusEnum | null): CsTagTone {
    return adjustmentStatusEnumSeverity(value);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.CANCELLATION.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.CANCELLATION.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.CANCELLATION.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<CancellationAdvancedFilters>>,
  ): void {
    // Limpa totais anteriores para evitar exibir valores desatualizados durante a nova busca.
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<CancellationAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetCancellationAdvancedFilters(this);
  }

  /* Filtros avancados — chips exibidos no topo do painel quando ativos */
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const saleDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodSaleDate(),
      this.saleDate(),
      this.i18n,
    );
    if (saleDateValue) {
      items.push({ label: this.i18n.tUi('cancellation.fields.saleDate'), value: saleDateValue });
    }

    const adjustmentDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodAdjustmentDate(),
      this.adjustmentDate(),
      this.i18n,
    );
    if (adjustmentDateValue) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.adjustmentDate'),
        value: adjustmentDateValue,
      });
    }

    const creditDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodCreditDate(),
      this.creditDate(),
      this.i18n,
    );
    if (creditDateValue) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.creditDate'),
        value: creditDateValue,
      });
    }

    const authorization = this.authorization();
    if (authorization) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.authorization'),
        value: authorization,
      });
    }

    const cvNsu = this.cvNsu();
    if (cvNsu) {
      items.push({ label: this.i18n.tUi('cancellation.fields.cvNsu'), value: cvNsu });
    }

    const acquirer = this.acquirers();
    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('cancellation.fields.acquirer'), value: labels });
    }

    const flag = this.flags();
    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('cancellation.fields.flag'), value: labels });
    }

    const valueLabel = currencyRangeLabel(this.i18n, this.valueStart(), this.valueEnd());
    if (valueLabel) {
      items.push({ label: this.i18n.tUi('cancellation.fields.saleValue'), value: valueLabel });
    }

    const adjValueLabel = currencyRangeLabel(
      this.i18n,
      this.adjustmentValueStart(),
      this.adjustmentValueEnd(),
    );
    if (adjValueLabel) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.adjustmentValue'),
        value: adjValueLabel,
      });
    }

    const company = this.companies();
    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('cancellation.fields.company'), value: labels });
    }

    const adjustmentReason = this.adjustmentReason();
    if (adjustmentReason?.length) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.adjustmentReason'),
        value: adjustmentReason.map((v) => adjustmentReasonEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const status = this.status();
    if (status?.length) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.status'),
        value: status.map((v) => adjustmentStatusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  /**
   * Constroi o payload de filtros para o endpoint de busca.
   * Arrays vazios sao omitidos (undefined) — o backend ignora campos ausentes.
   * Strings vazias sao omitidas com `|| undefined` (falsy em JS).
   * Numeros nulos usam `?? undefined` para manter 0 como valor valido.
   */
  protected override buildAdvancedFilters(): Partial<CancellationAdvancedFilters> {
    return {
      flags: this.flags()?.length ? this.flags()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      saleDate: this.saleDate() ?? undefined,
      periodSaleDate: this.periodSaleDate() ?? undefined,

      adjustmentDate: this.adjustmentDate() ?? undefined,
      periodAdjustmentDate: this.periodAdjustmentDate() ?? undefined,

      creditDate: this.creditDate() ?? undefined,
      periodCreditDate: this.periodCreditDate() ?? undefined,

      authorization: this.authorization() || undefined,
      cvNsu: this.cvNsu() || undefined,

      valueStart: this.valueStart() ?? undefined,
      valueEnd: this.valueEnd() ?? undefined,
      adjustmentValueStart: this.adjustmentValueStart() ?? undefined,
      adjustmentValueEnd: this.adjustmentValueEnd() ?? undefined,

      adjustmentReason: this.adjustmentReason()?.length ? this.adjustmentReason()! : undefined,
      status: this.status()?.length ? this.status()! : undefined,
    };
  }

  /**
   * Sincroniza os sinais de draft das colunas a partir do estado salvo pelo stateStorage da p-table.
   * Chamado em queueMicrotask para garantir que a tabela ja restaurou os filtros do localStorage.
   */
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
      'rvNumber',
      this.rvNumberColumnDraft,
      readSingleFilterValue,
    );

    this.syncTextColumnDraftFromTableState(
      filters,
      'saleValue',
      this.saleValueColumnDraft,
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
      'establishment',
      this.establishmentColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'reason',
      this.adjustmentReasonColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'status',
      this.statusColumnDraft,
      readArrayFilterValues,
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
      'adjustmentDate',
      this.adjustmentDateColumnPeriod,
      this.adjustmentDateColumnDraft,
      readPeriodFilterValue,
    );

    this.syncPeriodColumnDraftFromTableState(
      filters,
      'creditDate',
      this.creditDateColumnPeriod,
      this.creditDateColumnDraft,
      readPeriodFilterValue,
    );
  }

  /**
   * Converte os filtros inline da p-table em chips de filtro ativo.
   * Chamado pelo StatefulListPage quando a tabela emite evento de filtragem por coluna.
   * getAppliedLang() garante que os labels reavaliam ao trocar idioma.
   */
  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const flags = readArrayFilterValues(filters, 'flag');
    if (flags.length) {
      const labels = this.flagsOptions()
        .filter((o) => flags.includes(o.id))
        .map((o) => o.name);
      items.push({
        label: this.i18n.tUi('cancellation.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((o) => acquirers.includes(o.id))
        .map((o) => o.fantasyName);
      items.push({
        label: this.i18n.tUi('cancellation.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((o) => companies.includes(o.id))
        .map((o) => o.fantasyName);
      items.push({
        label: this.i18n.tUi('cancellation.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((o) => establishments.includes(o.id))
        .map((o) => o.pvNumber);
      items.push({
        label: this.i18n.tUi('cancellation.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const reasons = readArrayFilterValues(filters, 'reason');
    if (reasons.length) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.adjustmentReason'),
        value: reasons
          .map((v) => adjustmentReasonEnumLabel(v as AdjustmentReasonEnum, this.i18n))
          .join(', '),
      });
    }

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('cancellation.fields.status'),
        value: statuses
          .map((v) => adjustmentStatusEnumLabel(v as AdjustmentStatusEnum, this.i18n))
          .join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): AdjustmentCancellationFiltersState {
    return {
      flags: this.flags(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      saleDate: this.saleDate(),
      periodSaleDate: this.periodSaleDate(),

      adjustmentDate: this.adjustmentDate(),
      periodAdjustmentDate: this.periodAdjustmentDate(),

      creditDate: this.creditDate(),
      periodCreditDate: this.periodCreditDate(),

      authorization: this.authorization(),
      cvNsu: this.cvNsu(),

      valueStart: this.valueStart(),
      valueEnd: this.valueEnd(),
      adjustmentValueStart: this.adjustmentValueStart(),
      adjustmentValueEnd: this.adjustmentValueEnd(),

      adjustmentReason: this.adjustmentReason(),
      status: this.status(),
    };
  }

  protected override applyFiltersState(s: AdjustmentCancellationFiltersState): void {
    this.flags.set(s.flags ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.saleDate.set(s.saleDate ?? null);
    this.periodSaleDate.set(s.periodSaleDate ?? null);

    this.adjustmentDate.set(s.adjustmentDate ?? null);
    this.periodAdjustmentDate.set(s.periodAdjustmentDate ?? null);

    this.creditDate.set(s.creditDate ?? null);
    this.periodCreditDate.set(s.periodCreditDate ?? null);

    this.authorization.set(s.authorization ?? '');
    this.cvNsu.set(s.cvNsu ?? '');

    this.valueStart.set(s.valueStart ?? null);
    this.valueEnd.set(s.valueEnd ?? null);
    this.adjustmentValueStart.set(s.adjustmentValueStart ?? null);
    this.adjustmentValueEnd.set(s.adjustmentValueEnd ?? null);

    this.adjustmentReason.set(s.adjustmentReason ?? null);
    this.status.set(s.status ?? null);
  }

  /* Handlers dos ranges de valor — desacoplam o evento do CsCurrencyRangeFilterComponent
     nos dois sinais separados que o buildAdvancedFilters envia ao backend. */
  protected onValueRangeChange(value: CsCurrencyRangeValue): void {
    this.valueStart.set(value.start ?? null);
    this.valueEnd.set(value.end ?? null);
  }

  protected onAdjustmentValueRangeChange(value: CsCurrencyRangeValue): void {
    this.adjustmentValueStart.set(value.start ?? null);
    this.adjustmentValueEnd.set(value.end ?? null);
  }

  /* Acoes de busca cross-screen */

  /** Retorna as opcoes do menu de busca da linha (icone de lupa na tabela). */
  protected searchActions(row: AdjustmentCancellationModel): MenuItem[] {
    return [
      {
        label: this.i18n.tUi('common.search.salesSummary'),
        icon: 'pi pi-search',
        command: () => this.searchOnSalesSummary(row),
      },
    ];
  }

  /**
   * Navega para o Resumo de Vendas pre-filtrando pela empresa/estabelecimento/adquirente/bandeira
   * do registro selecionado. O filtro e gravado no localStorage da tela destino antes de abrir.
   */
  protected searchOnSalesSummary(row: AdjustmentCancellationModel): void {
    const targetFilters = {
      ...createEmptyAdjustmentCancellationFiltersState(),
      flags: row.flag?.id ? [row.flag.id] : null,
      companies: row.company?.id ? [row.company.id] : null,
      acquirers: row.acquirer?.id ? [row.acquirer.id] : null,
      establishments: row.establishment?.id ? [row.establishment.id] : null,
    };

    localStorage.setItem(
      STATE_KEY.CARDSYNC.SALES_SUMMARY.FILTERS.V1,
      JSON.stringify(targetFilters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.SALES_SUMMARY.TABLE.STATE.V1);

    this.openRouteInNewTab(['/documents/acq/sales-summary']);
  }

  /** Abre uma rota em nova aba sem recarregar a pagina atual. */
  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
