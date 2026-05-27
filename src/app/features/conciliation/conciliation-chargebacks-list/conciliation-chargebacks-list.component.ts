import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { CsTagComponent } from '@shared/ui';
import { ListQueryDto, SortDto } from '@shared/features/list-query/list-query.types';
import {
  ChargebackAnalysisFilter,
  ChargebackAnalysisTotalsModel,
  ChargebackLifecycleModel,
  ChargebackStatus,
  ChargebackTimelineEventModel,
} from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { compactId, formatCurrency, statusLabel, statusSeverity } from '../conciliation-ui';

type ChargebackStepKey =
  | 'REQUEST'
  | 'DOCUMENTATION'
  | 'PENDING_DEBIT'
  | 'FINANCIAL_TREATMENT'
  | 'FINANCIAL_CLOSURE'
  | 'FINAL_RESULT';

type ChargebackStageState = 'done' | 'current' | 'pending' | 'skipped';

interface ChargebackStageDefinition {
  key: ChargebackStepKey;
  title: string;
  helper: string;
}

interface ChargebackStageView extends ChargebackStageDefinition {
  order: number;
  state: ChargebackStageState;
  icon: string;
  eventDate: string | null;
  eventLabel: string | null;
  eventDescription: string | null;
  sourceType: string | null;
  processedFile: string | null;
}

@Component({
  selector: 'cs-conciliation-chargebacks-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DatePickerModule,
    DialogModule,
    FloatLabel,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    CsTagComponent,
  ],
  templateUrl: './conciliation-chargebacks-list.component.html',
  styleUrl: './conciliation-chargebacks-list.component.scss',
})
export class ConciliationChargebacksListComponent {
  private readonly service = inject(ConciliationService);

  private readonly STAGE_FLOW: ChargebackStageDefinition[] = [
    {
      key: 'REQUEST',
      title: 'Solicitação recebida',
      helper: 'A Rede registrou a contestação e abriu o processo para acompanhamento.',
    },
    {
      key: 'DOCUMENTATION',
      title: 'Prazo documental',
      helper: 'Período para envio ou conferência da documentação comprobatória da venda.',
    },
    {
      key: 'PENDING_DEBIT',
      title: 'Débito pendente',
      helper: 'Identificação de valor pendente relacionado à contestação.',
    },
    {
      key: 'FINANCIAL_TREATMENT',
      title: 'Compensação / tratativa financeira',
      helper: 'Acompanhamento de compensação via Net, banco ou desagendamento.',
    },
    {
      key: 'FINANCIAL_CLOSURE',
      title: 'Finalização financeira',
      helper: 'Liquidação ou encerramento financeiro do débito.',
    },
    {
      key: 'FINAL_RESULT',
      title: 'Resultado final',
      helper: 'Conclusão do chargeback: ganho, perdido ou revertido.',
    },
  ];

  protected readonly rows = signal<ChargebackLifecycleModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);
  protected readonly totals = signal<ChargebackAnalysisTotalsModel | null>(null);
  protected readonly selectedChargeback = signal<ChargebackLifecycleModel | null>(null);
  protected readonly detailDialogVisible = signal(false);

  protected readonly filtersVisible = signal(true);
  protected readonly filterNsu = signal<string | null>(null);
  protected readonly filterEventDateStart = signal<Date | null>(null);
  protected readonly filterEventDateEnd = signal<Date | null>(null);
  protected readonly filterValueStart = signal<number | null>(null);
  protected readonly filterValueEnd = signal<number | null>(null);
  protected readonly filterReason = signal<string | null>(null);
  protected readonly filterPvNumber = signal<string | null>(null);
  protected readonly filterRvNumber = signal<string | null>(null);
  protected readonly filterAuthorization = signal<string | null>(null);
  protected readonly filterProcessNumber = signal<string | null>(null);

  protected readonly totalDisputedValue = computed(() => this.totals()?.disputedValue ?? 0);
  protected readonly totalPendingValue = computed(() => this.totals()?.pendingValue ?? 0);
  protected readonly totalSettledValue = computed(() => this.totals()?.settledValue ?? 0);
  protected readonly totalCompensatedValue = computed(() => this.totals()?.compensatedValue ?? 0);

  protected readonly activeFilterCount = computed(() => {
    const entries = [
      this.filterNsu(),
      this.filterEventDateStart(),
      this.filterEventDateEnd(),
      this.filterValueStart(),
      this.filterValueEnd(),
      this.filterReason(),
      this.filterPvNumber(),
      this.filterRvNumber(),
      this.filterAuthorization(),
      this.filterProcessNumber(),
    ];

    return entries.filter(
      (value) => value !== null && value !== undefined && String(value).trim() !== '',
    ).length;
  });

  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sort = this.sortFromEvent(event);
    const body = this.queryBody(page, rows, sort);

    this.loading.set(true);

    this.service.listChargebackLifecycles(body).subscribe({
      next: (response) => {
        const uniqueRows = this.uniqueLifecycles(response.content ?? []);
        this.rows.set(uniqueRows);
        this.totalRecords.set(response.totalElements ?? uniqueRows.length);
        this.pageSize.set(rows);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });

    this.service.chargebacksTotals(this.queryBody(0, 1, [])).subscribe({
      next: (totals) => this.totals.set(totals),
      error: () => this.totals.set(null),
    });
  }

  protected applyAdvancedFilters(): void {
    this.load({ first: 0, rows: this.pageSize() });
  }

  protected clearAdvancedFilters(): void {
    this.filterNsu.set(null);
    this.filterEventDateStart.set(null);
    this.filterEventDateEnd.set(null);
    this.filterValueStart.set(null);
    this.filterValueEnd.set(null);
    this.filterReason.set(null);
    this.filterPvNumber.set(null);
    this.filterRvNumber.set(null);
    this.filterAuthorization.set(null);
    this.filterProcessNumber.set(null);
    this.load({ first: 0, rows: this.pageSize() });
  }

  protected toggleAdvancedFilters(): void {
    this.filtersVisible.update((visible) => !visible);
  }

  protected openChargeback(row: ChargebackLifecycleModel): void {
    this.selectedChargeback.set(row);
    this.detailDialogVisible.set(true);
  }

  protected closeChargeback(): void {
    this.detailDialogVisible.set(false);
    this.selectedChargeback.set(null);
  }

  protected onDetailVisibleChange(visible: boolean): void {
    this.detailDialogVisible.set(visible);

    if (!visible) {
      this.selectedChargeback.set(null);
    }
  }

  protected timeline(row: ChargebackLifecycleModel): ChargebackTimelineEventModel[] {
    return [...(row.timeline ?? [])].sort((a, b) => {
      const left = a.eventDate
        ? new Date(`${a.eventDate}T00:00:00`).getTime()
        : Number.MAX_SAFE_INTEGER;
      const right = b.eventDate
        ? new Date(`${b.eventDate}T00:00:00`).getTime()
        : Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  }

  protected currentStep(row: ChargebackLifecycleModel): number {
    return this.statusStep(row.currentStatus);
  }

  protected totalSteps(): number {
    return 6;
  }

  protected progressPercent(row: ChargebackLifecycleModel): number {
    return Math.min(100, Math.max(0, (this.currentStep(row) / this.totalSteps()) * 100));
  }

  protected stages(row: ChargebackLifecycleModel): ChargebackStageView[] {
    const timeline = this.timeline(row);
    const currentOrder = this.currentStep(row);

    return this.STAGE_FLOW.map((stage, index) => {
      const order = index + 1;
      const matchingEvents = timeline.filter(
        (event) => this.stageKeyFromEvent(event) === stage.key,
      );
      const latestEvent = matchingEvents.length ? matchingEvents[matchingEvents.length - 1] : null;
      const state = this.resolveStageState(order, currentOrder, !!latestEvent);

      return {
        ...stage,
        order,
        state,
        icon: this.stageIcon(stage.key, latestEvent?.status),
        eventDate: latestEvent?.eventDate ?? null,
        eventLabel: latestEvent ? this.statusLabel(latestEvent.status) : null,
        eventDescription: latestEvent
          ? this.eventFriendlyDescription(latestEvent)
          : this.emptyStageDescription(stage.key, state),
        sourceType: latestEvent?.sourceType ?? null,
        processedFile: latestEvent?.processedFile ?? null,
      };
    });
  }

  protected stageStateLabel(state: ChargebackStageState): string {
    switch (state) {
      case 'done':
        return 'Concluída';
      case 'current':
        return 'Atual';
      case 'skipped':
        return 'Sem evento';
      default:
        return 'Pendente';
    }
  }

  protected stageStateIcon(state: ChargebackStageState): string {
    switch (state) {
      case 'done':
        return 'pi pi-check';
      case 'current':
        return 'pi pi-arrow-right';
      case 'skipped':
        return 'pi pi-minus';
      default:
        return 'pi pi-circle';
    }
  }

  protected statusIcon(status?: ChargebackStatus | null): string {
    switch (status) {
      case 'REQUEST_RECEIVED':
        return 'pi pi-inbox';
      case 'DOCUMENTATION_DUE':
        return 'pi pi-file-edit';
      case 'DOCUMENTATION_OVERDUE':
        return 'pi pi-exclamation-triangle';
      case 'PENDING_DEBIT':
        return 'pi pi-clock';
      case 'BANK_DEBIT_SCHEDULED':
        return 'pi pi-building-columns';
      case 'NET_COMPENSATION_SCHEDULED':
        return 'pi pi-sync';
      case 'DESCHEDULED':
        return 'pi pi-calendar-times';
      case 'LIQUIDATED':
        return 'pi pi-check-circle';
      case 'LOST':
        return 'pi pi-times-circle';
      case 'REVERSED':
      case 'WON':
        return 'pi pi-undo';
      case 'UNDER_REVIEW':
        return 'pi pi-search';
      default:
        return 'pi pi-circle';
    }
  }

  protected deadlineHint(row: ChargebackLifecycleModel): string {
    const deadline = this.documentationDeadline(row);

    if (!deadline) return 'Sem prazo documental';

    const today = this.startOfDay(new Date());
    const dueDate = this.startOfDay(new Date(`${deadline}T00:00:00`));
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / 86_400_000);

    if (diffDays < 0) return `Prazo vencido há ${Math.abs(diffDays)} dia(s)`;
    if (diffDays === 0) return 'Prazo vence hoje';
    return `Prazo em ${diffDays} dia(s)`;
  }

  protected eventTitle(event: ChargebackTimelineEventModel): string {
    if (event.title?.trim()) return event.title;

    switch (event.status) {
      case 'REQUEST_RECEIVED':
        return 'Request recebido';
      case 'DOCUMENTATION_DUE':
        return 'Prazo para envio de documentação';
      case 'DOCUMENTATION_OVERDUE':
        return 'Prazo de documentação vencido';
      case 'PENDING_DEBIT':
        return 'Débito pendente identificado';
      case 'BANK_DEBIT_SCHEDULED':
        return 'Débito programado via banco';
      case 'NET_COMPENSATION_SCHEDULED':
        return 'Compensação programada via Net';
      case 'DESCHEDULED':
        return 'Valor desagendado';
      case 'LIQUIDATED':
        return 'Débito liquidado';
      case 'REVERSED':
        return 'Chargeback revertido';
      case 'WON':
        return 'Chargeback ganho';
      case 'LOST':
        return 'Chargeback perdido';
      case 'UNDER_REVIEW':
        return 'Chargeback em análise';
      default:
        return this.statusLabel(event.status);
    }
  }

  protected eventFriendlyDescription(event: ChargebackTimelineEventModel): string {
    if (event.description?.trim()) return event.description;

    switch (event.status) {
      case 'REQUEST_RECEIVED':
        return 'A Rede registrou uma solicitação de documentação para contestação da venda.';
      case 'DOCUMENTATION_DUE':
        return 'Ainda há prazo para enviar a documentação comprobatória da venda.';
      case 'DOCUMENTATION_OVERDUE':
        return 'O prazo para envio da documentação expirou. O chargeback pode seguir para débito se não houver regularização.';
      case 'PENDING_DEBIT':
        return 'Existe um débito pendente relacionado à contestação dessa venda.';
      case 'BANK_DEBIT_SCHEDULED':
        return 'O valor contestado foi programado para débito via banco.';
      case 'NET_COMPENSATION_SCHEDULED':
        return 'O valor contestado será compensado em créditos futuros pela regra de Net.';
      case 'DESCHEDULED':
        return 'Houve desagendamento de parcela ou valor futuro relacionado ao chargeback.';
      case 'LIQUIDATED':
        return 'O débito referente ao chargeback foi efetivamente liquidado.';
      case 'REVERSED':
        return 'O chargeback foi revertido, com retorno ou compensação positiva para o estabelecimento.';
      case 'WON':
        return 'A contestação foi resolvida a favor do estabelecimento.';
      case 'LOST':
        return 'A contestação foi finalizada com perda para o estabelecimento.';
      default:
        return 'Evento registrado no processo de chargeback.';
    }
  }

  protected emptyStageDescription(stage: ChargebackStepKey, state: ChargebackStageState): string {
    if (state === 'skipped') {
      switch (stage) {
        case 'PENDING_DEBIT':
          return 'Não houve registro específico de débito pendente para esta transação.';
        case 'FINANCIAL_CLOSURE':
          return 'Ainda não há registro de liquidação financeira para este chargeback.';
        case 'FINAL_RESULT':
          return 'O resultado final ainda não foi registrado nos arquivos processados.';
        default:
          return 'Esta etapa não teve evento específico registrado nos arquivos da Rede.';
      }
    }

    if (state === 'current') {
      return 'Esta é a etapa atual do processo, mas ainda não há evento detalhado vinculado.';
    }

    return 'Etapa ainda não atingida neste processo.';
  }

  protected statusHelpText(status?: ChargebackStatus | null): string {
    switch (status) {
      case 'REQUEST_RECEIVED':
        return 'A contestação foi registrada e precisa ser acompanhada.';
      case 'DOCUMENTATION_DUE':
        return 'Envie a documentação dentro do prazo para reduzir o risco de débito.';
      case 'DOCUMENTATION_OVERDUE':
        return 'Prazo expirado. Verifique se ainda há possibilidade de tratativa.';
      case 'PENDING_DEBIT':
        return 'Há valor pendente vinculado ao processo.';
      case 'BANK_DEBIT_SCHEDULED':
        return 'O débito será realizado via banco.';
      case 'NET_COMPENSATION_SCHEDULED':
        return 'O débito será compensado em créditos futuros.';
      case 'DESCHEDULED':
        return 'Valores futuros foram retirados da agenda de pagamento.';
      case 'LIQUIDATED':
        return 'O processo foi finalizado com liquidação do débito.';
      case 'REVERSED':
      case 'WON':
        return 'O processo foi concluído com reversão ou ganho.';
      case 'LOST':
        return 'O processo foi concluído com perda para o estabelecimento.';
      default:
        return 'Acompanhe a timeline para entender a evolução do caso.';
    }
  }

  protected nextActionLabel(row: ChargebackLifecycleModel): string {
    switch (row.currentStatus) {
      case 'REQUEST_RECEIVED':
      case 'DOCUMENTATION_DUE':
        return 'Enviar documentação';
      case 'DOCUMENTATION_OVERDUE':
        return 'Revisar prazo vencido';
      case 'PENDING_DEBIT':
        return 'Acompanhar débito pendente';
      case 'BANK_DEBIT_SCHEDULED':
        return 'Acompanhar débito bancário';
      case 'NET_COMPENSATION_SCHEDULED':
        return 'Acompanhar compensação';
      case 'DESCHEDULED':
        return 'Validar agenda de pagamento';
      case 'LIQUIDATED':
      case 'REVERSED':
      case 'WON':
      case 'LOST':
        return 'Processo finalizado';
      default:
        return 'Acompanhar evolução';
    }
  }

  protected sourceTypeLabel(sourceType?: string | null): string {
    const labels: Record<string, string> = {
      REQUEST: 'Request',
      REQUEST_ECOMMERCE: 'Request e-commerce',
      PENDING_DEBT: 'Débito pendente',
      SETTLED_DEBT: 'Débito liquidado',
      NET_ADJUSTMENT: 'Ajuste Net',
      BANK_DEBIT: 'Débito via banco',
      DESCHEDULEMENT: 'Desagendamento',
      CREDIT_REVERSAL: 'Reversão de crédito',
      CHARGEBACK_ADJUSTMENT: 'Ajuste de chargeback',
    };

    return sourceType ? (labels[sourceType] ?? sourceType) : '-';
  }

  protected documentationDeadline(row: ChargebackLifecycleModel): string | null {
    return (
      this.timeline(row).find(
        (event) => event.status === 'DOCUMENTATION_DUE' || event.status === 'DOCUMENTATION_OVERDUE',
      )?.eventDate ?? null
    );
  }

  protected displayDate(value?: string | null): string {
    return value ? value : '-';
  }

  protected hasEventValues(event: ChargebackTimelineEventModel): boolean {
    return !!(event.amount || event.pendingValue || event.settledValue || event.compensatedValue);
  }

  protected markerTone(status?: ChargebackStatus | null): string {
    return `is-${this.statusSeverity(status)}`;
  }

  protected readonly compactId = compactId;
  protected readonly formatCurrency = formatCurrency;
  protected readonly statusLabel = statusLabel;
  protected readonly statusSeverity = statusSeverity;

  private uniqueLifecycles(rows: ChargebackLifecycleModel[]): ChargebackLifecycleModel[] {
    const grouped = new Map<string, ChargebackLifecycleModel>();

    for (const row of rows) {
      const key = this.lifecycleIdentity(row);
      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, row);
        continue;
      }

      grouped.set(key, this.mergeLifecycle(existing, row));
    }

    return Array.from(grouped.values());
  }

  private mergeLifecycle(
    left: ChargebackLifecycleModel,
    right: ChargebackLifecycleModel,
  ): ChargebackLifecycleModel {
    const timeline = this.uniqueTimeline([...(left.timeline ?? []), ...(right.timeline ?? [])]);
    const winner = this.moreRecentLifecycle(left, right);

    return {
      ...left,
      ...winner,
      trackingKey: left.trackingKey || right.trackingKey,
      firstEventDate: this.earliestDate(left.firstEventDate, right.firstEventDate),
      lastEventDate: this.latestDate(left.lastEventDate, right.lastEventDate),
      currentStatus: winner.currentStatus ?? left.currentStatus ?? right.currentStatus,
      saleValue: this.firstValue(left.saleValue, right.saleValue),
      disputedValue: this.maxValue(left.disputedValue, right.disputedValue),
      pendingValue: this.firstValue(right.pendingValue, left.pendingValue),
      settledValue: this.firstValue(right.settledValue, left.settledValue),
      compensatedValue: this.firstValue(right.compensatedValue, left.compensatedValue),
      timeline,
    };
  }

  private uniqueTimeline(events: ChargebackTimelineEventModel[]): ChargebackTimelineEventModel[] {
    const grouped = new Map<string, ChargebackTimelineEventModel>();

    for (const event of events) {
      const key = [
        event.id,
        event.status,
        event.sourceType,
        event.eventDate,
        event.processedFile,
        event.amount,
        event.pendingValue,
        event.settledValue,
        event.compensatedValue,
      ]
        .map((value) => value ?? '')
        .join('|');

      grouped.set(key, event);
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const left = a.eventDate
        ? new Date(`${a.eventDate}T00:00:00`).getTime()
        : Number.MAX_SAFE_INTEGER;
      const right = b.eventDate
        ? new Date(`${b.eventDate}T00:00:00`).getTime()
        : Number.MAX_SAFE_INTEGER;
      return left - right;
    });
  }

  private lifecycleIdentity(row: ChargebackLifecycleModel): string {
    const pv = row.pvNumber ? String(row.pvNumber).trim() : null;
    const rv = row.rvNumber ? String(row.rvNumber).trim() : null;
    const nsu = row.nsu ? String(row.nsu).trim() : null;
    const authorization = this.normalizeIdentity(row.authorization);
    const tid = this.normalizeIdentity(row.tid);
    const processNumber = this.normalizeIdentity(row.processNumber);

    // Mesma regra do backend: a venda é a identidade principal.
    // O processo pode variar entre Request e evento financeiro da mesma transação.
    if (pv && nsu && authorization) {
      return `PV_NSU_AUTH|${pv}|${nsu}|${authorization}`;
    }

    if (tid) {
      return `TID|${tid}`;
    }

    if (pv && rv && nsu) {
      return `PV_RV_NSU|${pv}|${rv}|${nsu}`;
    }

    if (pv && nsu) {
      return `PV_NSU|${pv}|${nsu}`;
    }

    if (processNumber) {
      return `PROCESS|${processNumber}`;
    }

    return (
      row.trackingKey ||
      String(row.nsu ?? row.processNumber ?? row.lastEventDate ?? row.firstEventDate ?? 'UNKNOWN')
    );
  }

  private normalizeIdentity(value: string | null | undefined): string | null {
    const normalized = value
      ?.trim()
      .toUpperCase()
      .replace(/^0+(?!$)/, '');
    return normalized ? normalized : null;
  }

  private moreRecentLifecycle(
    left: ChargebackLifecycleModel,
    right: ChargebackLifecycleModel,
  ): ChargebackLifecycleModel {
    const leftTime = left.lastEventDate ? new Date(`${left.lastEventDate}T00:00:00`).getTime() : 0;
    const rightTime = right.lastEventDate
      ? new Date(`${right.lastEventDate}T00:00:00`).getTime()
      : 0;
    return rightTime >= leftTime ? right : left;
  }

  private firstValue<T>(...values: Array<T | null | undefined>): T | null {
    for (const value of values) {
      if (value !== null && value !== undefined) return value;
    }

    return null;
  }

  private maxValue(...values: Array<number | null | undefined>): number | null {
    const valid = values.filter((value): value is number => value !== null && value !== undefined);
    return valid.length ? Math.max(...valid) : null;
  }

  private latestDate(...values: Array<string | null | undefined>): string | null {
    const ordered = values.filter((value): value is string => !!value).sort();
    return ordered.length ? ordered[ordered.length - 1] : null;
  }

  private earliestDate(...values: Array<string | null | undefined>): string | null {
    const ordered = values.filter((value): value is string => !!value).sort();
    return ordered.length ? ordered[0] : null;
  }

  private queryBody(
    page: number,
    size: number,
    sort: SortDto[],
  ): ListQueryDto<ChargebackAnalysisFilter> {
    return {
      page,
      size,
      sort,
      tableFilters: {},
      globalFilter: null,
      advanced: this.advancedFilter(),
    };
  }

  private advancedFilter(): ChargebackAnalysisFilter {
    return {
      eventDateStart: this.toIsoDate(this.filterEventDateStart()),
      eventDateEnd: this.toIsoDate(this.filterEventDateEnd()),
      valueStart: this.filterValueStart(),
      valueEnd: this.filterValueEnd(),
      nsu: this.blankToNull(this.filterNsu()),
      reason: this.blankToNull(this.filterReason()),
      pvNumber: this.blankToNull(this.filterPvNumber()),
      rvNumber: this.blankToNull(this.filterRvNumber()),
      authorization: this.blankToNull(this.filterAuthorization()),
      processNumber: this.blankToNull(this.filterProcessNumber()),
    };
  }

  private toIsoDate(value: Date | string | null | undefined): string | null {
    if (!value) return null;

    if (typeof value === 'string') return value;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private blankToNull(value: string | null | undefined): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private sortFromEvent(event: TableLazyLoadEvent): SortDto[] {
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'lastEventDate';
    const order: 1 | -1 = event.sortOrder === 1 ? 1 : -1;

    return [{ field: sortField, order }];
  }

  private statusStep(status?: ChargebackStatus | null): number {
    const key = this.stageKeyFromStatus(status);
    const index = this.STAGE_FLOW.findIndex((stage) => stage.key === key);
    return index >= 0 ? index + 1 : 1;
  }

  private stageKeyFromStatus(status?: ChargebackStatus | string | null): ChargebackStepKey {
    switch (status) {
      case 'REQUEST_RECEIVED':
        return 'REQUEST';

      case 'DOCUMENTATION_DUE':
      case 'DOCUMENTATION_OVERDUE':
        return 'DOCUMENTATION';

      case 'PENDING_DEBIT':
      case 'UNDER_REVIEW':
        return 'PENDING_DEBIT';

      case 'BANK_DEBIT_SCHEDULED':
      case 'NET_COMPENSATION_SCHEDULED':
      case 'DESCHEDULED':
        return 'FINANCIAL_TREATMENT';

      case 'LIQUIDATED':
        return 'FINANCIAL_CLOSURE';

      case 'REVERSED':
      case 'WON':
      case 'LOST':
        return 'FINAL_RESULT';

      default:
        return 'REQUEST';
    }
  }

  private stageKeyFromEvent(event: ChargebackTimelineEventModel): ChargebackStepKey {
    const status = event.status;
    const sourceType = (event.sourceType ?? '').toUpperCase();
    const title = (event.title ?? '').toLowerCase();

    if (
      sourceType.includes('REQUEST') &&
      (title.includes('request recebido') ||
        title.includes('solicitação recebida') ||
        title.includes('solicitacao recebida'))
    ) {
      return 'REQUEST';
    }

    if (
      title.includes('prazo') ||
      status === 'DOCUMENTATION_DUE' ||
      status === 'DOCUMENTATION_OVERDUE'
    ) {
      return 'DOCUMENTATION';
    }

    if (status === 'REQUEST_RECEIVED') {
      return 'REQUEST';
    }

    if (status === 'PENDING_DEBIT' || status === 'UNDER_REVIEW') {
      return 'PENDING_DEBIT';
    }

    if (
      status === 'BANK_DEBIT_SCHEDULED' ||
      status === 'NET_COMPENSATION_SCHEDULED' ||
      status === 'DESCHEDULED'
    ) {
      return 'FINANCIAL_TREATMENT';
    }

    if (status === 'LIQUIDATED') {
      return 'FINANCIAL_CLOSURE';
    }

    if (status === 'REVERSED' || status === 'WON' || status === 'LOST') {
      return 'FINAL_RESULT';
    }

    return 'REQUEST';
  }

  private resolveStageState(
    order: number,
    currentOrder: number,
    hasEvent: boolean,
  ): ChargebackStageState {
    if (hasEvent) {
      return order === currentOrder ? 'current' : 'done';
    }

    if (order < currentOrder) return 'skipped';
    if (order === currentOrder) return 'current';
    return 'pending';
  }

  private stageIcon(stage: ChargebackStepKey, status?: ChargebackStatus | null): string {
    if (status) return this.statusIcon(status);

    switch (stage) {
      case 'REQUEST':
        return 'pi pi-inbox';
      case 'DOCUMENTATION':
        return 'pi pi-file-edit';
      case 'PENDING_DEBIT':
        return 'pi pi-clock';
      case 'FINANCIAL_TREATMENT':
        return 'pi pi-sync';
      case 'FINANCIAL_CLOSURE':
        return 'pi pi-check-circle';
      case 'FINAL_RESULT':
        return 'pi pi-flag';
      default:
        return 'pi pi-circle';
    }
  }

  private startOfDay(value: Date): Date {
    value.setHours(0, 0, 0, 0);
    return value;
  }
}
