import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelect } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagComponent } from '@shared/ui';
import { I18nService } from '@core/i18n/i18n.service';
import { STATE_KEY } from '@features/state-key.constants';
import { StatefulListPage } from '@features/list-base/stateful-list-page';
import { ProcessedFilesFacade } from '@features/facade/processed-files.facade';
import { buildListQuery } from '@shared/features/list-query/list-query.builder';
import { fileStatusSeverity as getFileStatusSeverity } from '../file-processing-ui';
import { allPeriodEnum, PeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ProcessedFileModel, FileProcessingStatus } from '@models/file-processing.models';
import { CsColumnFilterShellComponent } from '@features/list-base/cs-column-filter-shell.component';
import { CsAdvancedTextFilterComponent } from '@features/list-base/cs-advanced-text-filter.component';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  ProcessedFilesFiltersState,
  ProcessedFilesAdvancedFilters,
  resetProcessedFilesAdvancedFilters,
} from '@features/filter/processed-files.filters';
import {
  readArrayFilterValues,
  readSingleFilterValue,
} from '@features/list-base/table-filter-readers';
import {
  ActiveFilterItem,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

/**
 * Lista paginada de arquivos processados (ERP, Rede, CNAB).
 * Variante: Simples — busca e visualizacao sem totais nem selecao em batch.
 * Endpoint: POST /bff/v1/file-processing/files/search
 * Filtros painel: data arquivo (+ periodo), data importacao (+ periodo), origem, status
 * Colunas: arquivo, origem, status, linhas, pendencias, data importacao, acoes
 * Filtros de coluna: fileName (texto), origin (multiselect), status (multiselect)
 */
@Component({
  standalone: true,
  selector: 'cs-processed-files-list',
  styleUrl: './processed-files-list.component.scss',
  templateUrl: './processed-files-list.component.html',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    MultiSelect,
    TooltipModule,
    CsTagComponent,
    InputTextModule,
    TranslateModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsColumnFilterShellComponent,
    CsAdvancedTextFilterComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class ProcessedFilesListComponent
  extends StatefulListPage<ProcessedFilesFiltersState, ProcessedFilesAdvancedFilters>
  implements AfterViewInit
{
  @ViewChild('dt') private dt?: Table;

  protected override readonly i18n = inject(I18nService);

  readonly facade = inject(ProcessedFilesFacade);

  readonly totalRecords = computed(() => this.facade.totalRecords());
  readonly items = computed<ProcessedFileModel[]>(() => this.facade.items());

  /* Restaura tamanho de pagina da sessao anterior; cai no padrao se nao existir */
  override rows =
    Number(localStorage.getItem(this.tableRowsKey())) || StatefulListPage.DEFAULT_ROWS;

  /* Opcoes de enum reativas ao idioma */
  readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({
      label: periodEnumLabel(value, this.i18n),
      value,
    }));
  });

  /* Filtros avancados */
  readonly fileName = signal('');

  readonly group = signal<string[] | null>(null);
  readonly periodDateFile = signal<PeriodEnum | null>(null);
  readonly dateFile = signal<string | string[] | null>(null);
  readonly periodDateImport = signal<PeriodEnum | null>(null);
  readonly dateImport = signal<string | string[] | null>(null);
  readonly status = signal<FileProcessingStatus[] | null>(null);

  /* Datepicker so habilita quando o periodo esta selecionado */
  readonly isDateFileDisabled = computed(() => !this.periodDateFile());
  readonly isDateImportDisabled = computed(() => !this.periodDateImport());

  /* Drafts colunas tabela */
  fileNameColumnDraft = signal('');
  groupColumnDraft = signal<string[] | null>(null);
  statusColumnDraft = signal<string[] | null>(null);

  readonly groupOptions = [
    { label: 'ERP', value: 'ERP' },
    { label: 'ADQ', value: 'ADQ' },
    { label: 'BANK', value: 'BANK' },
  ];

  readonly statusOptions: { label: string; value: FileProcessingStatus }[] = [
    { label: 'Processado', value: 'PROCESSED' },
    { label: 'Com avisos', value: 'PROCESSED_WITH_WARNINGS' },
    { label: 'Erro', value: 'ERROR' },
    { label: 'Duplicado', value: 'DUPLICATE' },
    { label: 'Inválido', value: 'INVALID' },
    { label: 'Processando', value: 'PROCESSING' },
    { label: 'Recebido', value: 'RECEIVED' },
  ];

  protected readonly fileStatusSeverity = getFileStatusSeverity;

  ngOnInit(): void {
    this.initStatefulList();
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncColumnDraftsFromTableState());
  }

  /** Limpa todos os filtros, o estado da tabela e recarrega a primeira pagina. */
  clear(): void {
    const key = this.tableStateKey();
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

    this.resetFilters();

    this.fileNameColumnDraft.set('');
    this.groupColumnDraft.set(null);
    this.statusColumnDraft.set(null);

    this.dt?.clear();
    this.clearTableAndReload(this.dt);
  }

  protected override tableStateKey(): string {
    return STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.TABLE.STATE.V1;
  }

  protected override tableRowsKey(): string {
    return STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.TABLE.ROWS.V1;
  }

  protected override filtersKey(): string {
    return STATE_KEY.CARDSYNC.PROCESSED_FILES.FILES.FILTERS.V1;
  }

  protected override loadPage(
    query: ReturnType<typeof buildListQuery<ProcessedFilesAdvancedFilters>>,
  ): void {
    this.facade.loadPage(query);
  }

  protected override loadFirstPage(): void {
    const query = buildListQuery<ProcessedFilesAdvancedFilters>(
      { page: 0, size: this.rows },
      this.buildAdvancedFilters(),
    );
    this.facade.loadPage(query);
  }

  protected override refresh(): void {
    this.reloadWithCurrentState();
  }

  protected override resetFilters(): void {
    resetProcessedFilesAdvancedFilters(this);
  }

  /**
   * Constroi o payload de filtros para o endpoint de busca.
   * Arrays vazios sao omitidos (undefined).
   * Strings vazias sao omitidas com `.trim() || undefined`.
   */
  protected override buildAdvancedFilters(): Partial<ProcessedFilesAdvancedFilters> {
    return {
      fileName: this.fileName().trim() || undefined,
      group: this.group()?.length ? this.group()! : undefined,
      status: this.status()?.length ? this.status()! : undefined,
      dateFile: this.dateFile() ?? undefined,
      periodDateFile: this.periodDateFile() ?? undefined,
      dateImport: this.dateImport() ?? undefined,
      periodDateImport: this.periodDateImport() ?? undefined,
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
      'file',
      this.fileNameColumnDraft,
      readSingleFilterValue,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'group',
      this.groupColumnDraft,
      readArrayFilterValues,
    );

    this.syncArrayColumnDraftFromTableState(
      filters,
      'status',
      this.statusColumnDraft,
      readArrayFilterValues,
    );
  }

  /**
   * Converte os filtros inline da p-table em chips de filtro ativo.
   * getAppliedLang() garante que os labels reavaliam ao trocar idioma.
   */
  protected override mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const fileName = readSingleFilterValue(filters, 'file');
    if (fileName) {
      items.push({ label: this.i18n.tUi('processedFiles.fields.fileName'), value: fileName });
    }

    const groups = readArrayFilterValues(filters, 'group');
    if (groups.length) {
      items.push({
        label: this.i18n.tUi('processedFiles.fields.origin'),
        value: groups.join(', '),
      });
    }

    const statuses = readArrayFilterValues(filters, 'status');
    if (statuses.length) {
      items.push({
        label: this.i18n.tUi('processedFiles.fields.status'),
        value: statuses.join(', '),
      });
    }

    return items;
  }

  /* Filtros avancados — chips exibidos no topo do painel quando ativos */
  protected override readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    const items: ActiveFilterItem[] = [];

    const dateFileValue = this.formatActiveFilterPeriodDateValue(
      this.periodDateFile(),
      this.dateFile(),
      this.i18n,
    );
    if (dateFileValue) {
      items.push({ label: this.i18n.tUi('processedFiles.fields.dateFile'), value: dateFileValue });
    }

    const dateImportValue = this.formatActiveFilterPeriodDateValue(
      this.periodDateImport(),
      this.dateImport(),
      this.i18n,
    );
    if (dateImportValue) {
      items.push({
        label: this.i18n.tUi('processedFiles.fields.dateImport'),
        value: dateImportValue,
      });
    }

    const group = this.group();
    if (group?.length) {
      items.push({ label: this.i18n.tUi('processedFiles.fields.origin'), value: group.join(', ') });
    }

    const status = this.status();
    if (status?.length) {
      items.push({
        label: this.i18n.tUi('processedFiles.fields.status'),
        value: status.join(', '),
      });
    }

    return items;
  });

  protected override toFiltersState(): ProcessedFilesFiltersState {
    return {
      fileName: this.fileName(),
      group: this.group(),
      status: this.status(),
      dateFile: this.dateFile(),
      periodDateFile: this.periodDateFile(),
      dateImport: this.dateImport(),
      periodDateImport: this.periodDateImport(),
    };
  }

  protected override applyFiltersState(s: ProcessedFilesFiltersState): void {
    this.fileName.set(s.fileName ?? '');
    this.group.set(s.group ?? null);
    this.status.set(s.status ?? null);
    this.dateFile.set(s.dateFile ?? null);
    this.periodDateFile.set(s.periodDateFile ?? null);
    this.dateImport.set(s.dateImport ?? null);
    this.periodDateImport.set(s.periodDateImport ?? null);
  }
}
