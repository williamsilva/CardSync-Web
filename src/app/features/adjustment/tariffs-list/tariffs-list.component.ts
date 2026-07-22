import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

import { CsTagTone, CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { STATE_KEY } from '@features/state-key.constants';
import { FlagFacade } from '@features/facade/flag.facade';
import { CsDocumentPipe } from '@shared/pipes/cs-document.pipe';
import { CompanyFacade } from '@features/facade/company.facade';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { AdjustmentTariffsModel } from '@models/adjustment-tariffs.model';
import { EstablishmentFacade } from '@features/facade/establishment.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { AdjustmentTariffsFacade } from '@features/facade/adjustment-tariffs.facade';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { StatusEnum, statusEnumLabel, statusEnumSeverity } from '@models/enums/status.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import { CsAdvancedFilterItemTemplateDirective } from '@features/list-base/cs-advanced-filter-item-template.directive';
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
  AdjustmentAdvancedFilters,
  AdjustmentTariffsFiltersState,
  resetAdjustmentAdvancedFilters,
  createEmptyAdjustmentTariffsFiltersState,
} from '@features/filter/adjustment-tariffs.filters';
import {
  AdjustmentReasonEnum,
  adjustmentReasonEnumLabel,
  adjustmentReasonEnumSeverity,
  allAdjustmentTariffsReasonEnum,
} from '@models/enums/adjustment-reason.enum';
import {
  AdjustmentStatusEnum,
  adjustmentStatusEnumLabel,
  adjustmentStatusEnumSeverity,
  allAdjustmentTariffsStatusEnum,
} from '@models/enums/adjustment-status.enum';
import {
  currencyRangeLabel,
  CsCurrencyRangeValue,
  CsCurrencyRangeFilterComponent,
} from '@features/list-base/cs-currency-range-filter.component';

/**
 * Lista paginada de tarifas e ajustes aplicados pela adquirente.
 *
 * Variante: Simples — somente busca e navegação cross-screen.
 * Endpoint: POST /v1/adjustments/search | /totals
 *
 * Filtros do painel:
 *   Linha 1 — Período/Data Ajuste · Período/Data Crédito · Adquirente · Bandeira · Motivo
 *   Linha 2 — Empresa · Estabelecimento · RV Ajuste · Status
 *
 * Colunas da tabela (11):
 *   Empresa · Estab. · Adquirente · Bandeira · Data Ajuste · Data Crédito
 *   RV Ajuste · Ajuste (valor) · Tipo (motivo) · Status · Buscar
 */
@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'app-tariffs-list',
  templateUrl: './tariffs-list.component.html',
  imports: [
    Menu,
    Select,
    Tooltip,
    CsDatePipe,
    DatePicker,
    TableModule,
    MultiSelect,
    FormsModule,
    ButtonModule,
    CsCurrencyPipe,
    CsTagComponent,
    CsDocumentPipe,
    InputTextModule,
    TranslateModule,
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
export class TariffsListComponent
  extends StatefulListPage<AdjustmentTariffsFiltersState, AdjustmentAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(AdjustmentTariffsFacade);

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
  readonly items = computed<AdjustmentTariffsModel[]>(
    () => this.facade.items() as AdjustmentTariffsModel[],
  );

  /* Restaura o tamanho de página da sessão anterior; cai no padrão se não existir */
  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  /* Opções de enum reativas ao idioma — getAppliedLang() força reavaliação ao trocar língua */
  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly adjustmentReasonOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allAdjustmentTariffsReasonEnum().map((value) => ({
      label: adjustmentReasonEnumLabel(value, this.i18n),
      value,
    }));
  });

  readonly adjustmentStatusOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allAdjustmentTariffsStatusEnum().map((value) => ({
      label: adjustmentStatusEnumLabel(value, this.i18n),
      value,
    }));
  });

  /* Filtros avançados — painel lateral de filtros, persistidos em localStorage via filtersKey() */
  readonly flags = signal<string[] | null>(null);
  readonly companies = signal<string[] | null>(null);
  readonly acquirers = signal<string[] | null>(null);
  readonly establishments = signal<string[] | null>(null);

  readonly periodAdjustmentDate = signal<PeriodEnum | null>(null);
  readonly adjustmentDate = signal<string | string[] | null>(null); // string[] quando range/mês

  readonly creditDate = signal<string | string[] | null>(null);
  readonly periodCreditDate = signal<PeriodEnum | null>(null);

  readonly adjustmentValueStart = signal<number | null>(null); // range do valor do ajuste
  readonly adjustmentValueEnd = signal<number | null>(null);

  readonly rvNumberAdjustment = signal<string>(''); // texto livre; '' → omitido no payload
  readonly status = signal<AdjustmentStatusEnum[] | null>(null);
  readonly adjustmentReason = signal<AdjustmentReasonEnum[] | null>(null);

  /* Datepicker só habilita quando o período está selecionado */
  readonly isCreditDateDisabled = computed(() => !this.periodCreditDate());
  readonly isAdjustmentDateDisabled = computed(() => !this.periodAdjustmentDate());

  readonly adjustmentValueRange = computed<CsCurrencyRangeValue>(() => ({
    start: this.adjustmentValueStart(),
    end: this.adjustmentValueEnd(),
  }));

  /* Drafts colunas tabela — espelham os filtros inline da p-table, NÃO persistidos separadamente.
     São inicializados a partir do estado salvo em ngAfterViewInit via syncColumnDraftsFromTableState. */
  readonly rvNumberAdjustmentColumnDraft = signal('');

  readonly flagColumnDraft = signal<string[] | null>(null);
  readonly companyColumnDraft = signal<string[] | null>(null);
  readonly acquirerColumnDraft = signal<string[] | null>(null);
  readonly establishmentColumnDraft = signal<string[] | null>(null);

  readonly adjustmentDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly adjustmentDateColumnDraft = signal<string | string[] | null>(null);

  readonly creditDateColumnPeriod = signal<PeriodEnum | null>(null);
  readonly creditDateColumnDraft = signal<string | string[] | null>(null);

  readonly adjustmentValueColumnDraft = signal('');
  readonly adjustmentReasonColumnDraft = signal<AdjustmentReasonEnum[] | null>(null);
  readonly statusColumnDraft = signal<AdjustmentStatusEnum[] | null>(null);

  readonly isAdjustmentDateColumnDisabled = computed(() => !this.adjustmentDateColumnPeriod());
  readonly isCreditDateColumnDisabled = computed(() => !this.creditDateColumnPeriod());

  ngOnInit(): void {
    // Carrega opções dos filtros antes de initStatefulList, que pode restaurar
    // filtros salvos que dependem dessas listas para exibir os labels corretamente.
    this.flagFacade.loadFlagOptionsFilter();
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.establishmentFacade.loadEstablishmentOptionsFilter();

    // Deve ser o último — restaura estado da sessão anterior e dispara a primeira carga.
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    // queueMicrotask garante que os filtros da p-table já foram inicializados pelo stateStorage
    // antes de tentarmos lê-los para popular os sinais de draft das colunas.
    queueMicrotask(() => {
      this.syncColumnDraftsFromTableState();
    });
  }

  /** Limpa todos os filtros, o estado da tabela e recarrega a primeira página. */
  clear(): void {
    const key = this.tableStateKey();

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();
    this.adjustmentValueColumnDraft.set('');
    this.rvNumberAdjustmentColumnDraft.set('');

    this.flagColumnDraft.set(null);
    this.statusColumnDraft.set(null);
    this.companyColumnDraft.set(null);
    this.acquirerColumnDraft.set(null);
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
    return STATE_KEY.CARDSYNC.ADJUSTMENT.TARIFFS.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.TARIFFS.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.ADJUSTMENT.TARIFFS.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<AdjustmentAdvancedFilters>>,
  ): void {
    // Limpa totais anteriores para evitar exibir valores desatualizados durante a nova busca.
    this.facade.clearTotals();
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<AdjustmentAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetAdjustmentAdvancedFilters(this);
  }

  /* Filtros avançados — chips exibidos no topo do painel quando ativos */
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const flag = this.flags();
    const status = this.status();
    const company = this.companies();
    const acquirer = this.acquirers();
    const establishment = this.establishments();
    const adjustmentReason = this.adjustmentReason();
    const rvNumberAdjustment = this.rvNumberAdjustment();

    const adjustmentDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodAdjustmentDate(),
      this.adjustmentDate(),
      this.i18n,
    );
    if (adjustmentDateValue) {
      items.push({
        label: this.i18n.tUi('adjustment.fields.adjustmentDate'),
        value: adjustmentDateValue,
      });
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

    const creditDateValue = this.formatActiveFilterPeriodDateValue(
      this.periodCreditDate(),
      this.creditDate(),
      this.i18n,
    );
    if (creditDateValue) {
      items.push({
        label: this.i18n.tUi('adjustment.fields.creditDate'),
        value: creditDateValue,
      });
    }

    if (acquirer?.length) {
      const labels = this.acquirersOptions()
        .filter((opt) => acquirer.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('adjustment.fields.acquirer'), value: labels });
    }

    if (flag?.length) {
      const labels = this.flagsOptions()
        .filter((opt) => flag.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({ label: this.i18n.tUi('adjustment.fields.flag'), value: labels });
    }

    if (company?.length) {
      const labels = this.companiesOptions()
        .filter((opt) => company.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({ label: this.i18n.tUi('adjustment.fields.company'), value: labels });
    }

    if (establishment?.length) {
      const labels = this.establishmentsOptions()
        .filter((opt) => establishment.includes(opt.id))
        .map((opt) => opt.pvNumber)
        .join(', ');
      items.push({ label: this.i18n.tUi('adjustment.fields.establishment'), value: labels });
    }

    if (rvNumberAdjustment) {
      items.push({ label: this.i18n.tUi('adjustment.fields.rvNumber'), value: rvNumberAdjustment });
    }

    if (adjustmentReason?.length) {
      items.push({
        label: this.i18n.tUi('adjustment.fields.adjustmentReason'),
        value: adjustmentReason.map((v) => adjustmentReasonEnumLabel(v, this.i18n)).join(', '),
      });
    }

    if (status?.length) {
      items.push({
        label: this.i18n.tUi('adjustment.fields.status'),
        value: status.map((v) => adjustmentStatusEnumLabel(v, this.i18n)).join(', '),
      });
    }

    return items;
  });

  /**
   * Constrói o payload de filtros para o endpoint de busca.
   * Arrays vazios são omitidos (undefined) — o backend ignora campos ausentes.
   * Strings vazias são omitidas com `|| undefined` (falsy em JS).
   */
  protected override buildAdvancedFilters(): Partial<AdjustmentAdvancedFilters> {
    return {
      flags: this.flags()?.length ? this.flags()! : undefined,
      acquirers: this.acquirers()?.length ? this.acquirers()! : undefined,
      companies: this.companies()?.length ? this.companies()! : undefined,
      establishments: this.establishments()?.length ? this.establishments()! : undefined,

      adjustmentDate: this.adjustmentDate() ?? undefined,
      periodAdjustmentDate: this.periodAdjustmentDate() ?? undefined,

      creditDate: this.creditDate() ?? undefined,
      periodCreditDate: this.periodCreditDate() ?? undefined,

      rvNumberAdjustment: this.rvNumberAdjustment() || undefined,
      adjustmentValueStart: this.adjustmentValueStart() ?? undefined,
      adjustmentValueEnd: this.adjustmentValueEnd() ?? undefined,

      adjustmentReason: this.adjustmentReason()?.length ? this.adjustmentReason()! : undefined,
      status: this.status()?.length ? this.status()! : undefined,
    };
  }

  /**
   * Sincroniza os sinais de draft das colunas a partir do estado salvo pelo stateStorage da p-table.
   * Chamado em queueMicrotask para garantir que a tabela já restaurou os filtros do localStorage.
   */
  protected syncColumnDraftsFromTableState(): void {
    const filters = this.dt?.filters;
    if (!filters) return;

    this.syncTextColumnDraftFromTableState(
      filters,
      'rvNumberAdjustment',
      this.rvNumberAdjustmentColumnDraft,
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

    this.syncTextColumnDraftFromTableState(
      filters,
      'adjustmentValue',
      this.adjustmentValueColumnDraft,
      readSingleFilterValue,
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
        .filter((option) => flags.includes(option.id))
        .map((option) => option.name);
      items.push({
        label: this.i18n.tUi('adjustment.fields.flag'),
        value: (labels.length ? labels : flags).join(', '),
      });
    }

    const acquirers = readArrayFilterValues(filters, 'acquirer');
    if (acquirers.length) {
      const labels = this.acquirersOptions()
        .filter((option) => acquirers.includes(option.id))
        .map((option) => option.fantasyName);
      items.push({
        label: this.i18n.tUi('adjustment.fields.acquirer'),
        value: (labels.length ? labels : acquirers).join(', '),
      });
    }

    const companies = readArrayFilterValues(filters, 'company');
    if (companies.length) {
      const labels = this.companiesOptions()
        .filter((option) => companies.includes(option.id))
        .map((option) => option.fantasyName);
      items.push({
        label: this.i18n.tUi('adjustment.fields.company'),
        value: (labels.length ? labels : companies).join(', '),
      });
    }

    const establishments = readArrayFilterValues(filters, 'establishment');
    if (establishments.length) {
      const labels = this.establishmentsOptions()
        .filter((option) => establishments.includes(option.id))
        .map((option) => option.pvNumber);
      items.push({
        label: this.i18n.tUi('adjustment.fields.establishment'),
        value: (labels.length ? labels : establishments).join(', '),
      });
    }

    const reasons = readArrayFilterValues(filters, 'reason');
    if (reasons.length) {
      items.push({
        label: this.i18n.tUi('adjustment.fields.adjustmentReason'),
        value: reasons
          .map((v) => adjustmentReasonEnumLabel(v as AdjustmentReasonEnum, this.i18n))
          .join(', '),
      });
    }

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('adjustment.fields.status'),
        value: statuses
          .map((v) => adjustmentStatusEnumLabel(v as AdjustmentStatusEnum, this.i18n))
          .join(', '),
      });
    }

    return items;
  }

  protected override toFiltersState(): AdjustmentTariffsFiltersState {
    return {
      flags: this.flags(),
      acquirers: this.acquirers(),
      companies: this.companies(),
      establishments: this.establishments(),

      adjustmentDate: this.adjustmentDate(),
      periodAdjustmentDate: this.periodAdjustmentDate(),

      creditDate: this.creditDate(),
      periodCreditDate: this.periodCreditDate(),

      rvNumberAdjustment: this.rvNumberAdjustment(),
      adjustmentValueStart: this.adjustmentValueStart(),
      adjustmentValueEnd: this.adjustmentValueEnd(),

      adjustmentReason: this.adjustmentReason(),
      status: this.status(),
    };
  }

  protected override applyFiltersState(s: AdjustmentTariffsFiltersState): void {
    this.flags.set(s.flags ?? null);
    this.acquirers.set(s.acquirers ?? null);
    this.companies.set(s.companies ?? null);
    this.establishments.set(s.establishments ?? null);

    this.adjustmentDate.set(s.adjustmentDate ?? null);
    this.periodAdjustmentDate.set(s.periodAdjustmentDate ?? null);

    this.creditDate.set(s.creditDate ?? null);
    this.periodCreditDate.set(s.periodCreditDate ?? null);

    this.rvNumberAdjustment.set(s.rvNumberAdjustment ?? '');

    this.adjustmentReason.set(s.adjustmentReason ?? null);
    this.status.set(s.status ?? null);

    this.adjustmentValueStart.set(s.adjustmentValueStart ?? null);
    this.adjustmentValueEnd.set(s.adjustmentValueEnd ?? null);
  }

  /* Handlers dos ranges de valor — desacoplam o evento do CsCurrencyRangeFilterComponent
     nos dois sinais separados que o buildAdvancedFilters envia ao backend. */
  protected onAdjustmentValueRangeChange(value: CsCurrencyRangeValue): void {
    this.adjustmentValueStart.set(value.start ?? null);
    this.adjustmentValueEnd.set(value.end ?? null);
  }

  /* Ações de busca cross-screen */

  /** Retorna as opções do menu de busca da linha (ícone de lupa na tabela). */
  protected searchActions(row: AdjustmentTariffsModel): MenuItem[] {
    return [
      {
        label: this.i18n.tUi('common.search.salesSummary'),
        icon: 'pi pi-search',
        command: () => this.searchOnSalesSummary(row),
      },
    ];
  }

  /**
   * Navega para o Resumo de Vendas pré-filtrando pela empresa/estabelecimento/adquirente/bandeira
   * do registro selecionado. O filtro é gravado no localStorage da tela destino antes de abrir.
   */
  protected searchOnSalesSummary(row: AdjustmentTariffsModel): void {
    const targetFilters = {
      ...createEmptyAdjustmentTariffsFiltersState(),
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

  /** Abre uma rota em nova aba sem recarregar a página atual. */
  protected openRouteInNewTab(
    commands: unknown[],
    extras: { queryParams?: Record<string, string> } = {},
  ): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands, extras));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }
}
