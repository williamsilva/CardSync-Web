import { Component, computed, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagComponent } from '@shared/ui';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { PermissionService } from '@core/auth/permission.service';
import { ConciliationDashboardModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { FileProcessingService } from '@features/service/file-processing.service';
import { ConciliationWaitingFacade } from '@features/facade/conciliation-waiting.facade';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { FinancialReconciliationPipelineResultModel } from '@models/file-processing.models';
import {
  ReconcileBankResultModel,
  ReconcileFeesResultModel,
  ErpCancellationReprocessResult,
  ReconcileErpAcquirerResultModel,
  ReconcileAcquirerSaleSummaryResultModel,
  ReconcileSalesSummaryCreditOrderResultModel,
  ReconcileSalesSummaryTransactionsResultModel,
} from '@models/conciliation-waiting.model';
import {
  CancellationReprocessPayload,
  CancellationReprocessDialogComponent,
} from '../conciliation-dashboard/cancellation-reprocess-dialog.component';

@Component({
  standalone: true,
  selector: 'cs-reconciliation-actions',
  styleUrl: './reconciliation-actions.component.scss',
  templateUrl: './reconciliation-actions.component.html',
  imports: [
    CardModule,
    ButtonModule,
    CsCurrencyPipe,
    CsTagComponent,
    TranslateModule,
    PageHeaderComponent,
    CancellationReprocessDialogComponent,
  ],
})
export class ReconciliationActionsComponent {
  private readonly perms = inject(PermissionService);
  private readonly service = inject(ConciliationService);
  private readonly facade = inject(ConciliationWaitingFacade);
  private readonly fileProcessingService = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly dashboard = signal<ConciliationDashboardModel | null>(null);

  protected readonly summary = computed(() => this.dashboard()?.summary ?? null);
  protected readonly comparison = computed(() => this.dashboard()?.erpVsAcquirer ?? null);

  protected readonly canProcess = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  // loading flags
  protected readonly reconcilingFees = signal(false);
  protected readonly reconcilingBank = signal(false);
  protected readonly runningPipeline = signal(false);
  protected readonly reconcileManualSwapped = signal(false);
  protected readonly reconcilingCreditOrder = signal(false);
  protected readonly reconcilingErpVsAcquirer = signal(false);
  protected readonly reprocessingCancellations = signal(false);
  protected readonly reconcilingAcquirerSaleSummary = signal(false);
  protected readonly cancellationReprocessDialogVisible = signal(false);
  protected readonly reconcilingSalesSummaryTransactions = signal(false);

  // result signals
  protected readonly reconcileBankResult = signal<ReconcileBankResultModel | null>(null);
  protected readonly reconcileFeesResult = signal<ReconcileFeesResultModel | null>(null);
  protected readonly reconcileErpAcqResult = signal<ReconcileErpAcquirerResultModel | null>(null);

  protected readonly reconcileManualSwappedResult = signal<ReconcileErpAcquirerResultModel | null>(
    null,
  );
  protected readonly reconcileSalesSummaryTransactionsResult =
    signal<ReconcileSalesSummaryTransactionsResultModel | null>(null);

  protected readonly cancellationReprocessResult = signal<ErpCancellationReprocessResult | null>(
    null,
  );
  protected readonly reconcileAcquirerSaleSummaryResult =
    signal<ReconcileAcquirerSaleSummaryResultModel | null>(null);

  protected readonly reconcileSalesSummaryCreditOrderResult =
    signal<ReconcileSalesSummaryCreditOrderResultModel | null>(null);

  protected readonly pipelineResult = signal<FinancialReconciliationPipelineResultModel | null>(
    null,
  );

  protected readonly anyProcessing = computed(
    () =>
      this.reconcilingErpVsAcquirer() ||
      this.reconcileManualSwapped() ||
      this.reconcilingSalesSummaryTransactions() ||
      this.reprocessingCancellations() ||
      this.reconcilingFees() ||
      this.reconcilingAcquirerSaleSummary() ||
      this.reconcilingCreditOrder() ||
      this.reconcilingBank() ||
      this.runningPipeline(),
  );

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service.getDashboard().subscribe({
      next: (response) => this.dashboard.set(response),
      error: () => {
        this.dashboard.set(null);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected processReconciliationErpVsAcquirer(): void {
    if (this.reconcilingErpVsAcquirer()) return;
    this.reconcilingErpVsAcquirer.set(true);
    this.reconcileErpAcqResult.set(null);
    this.facade
      .reconcileErpVsAcquirer()
      .pipe(finalize(() => this.reconcilingErpVsAcquirer.set(false)))
      .subscribe({ next: (r) => this.reconcileErpAcqResult.set(r) });
  }

  protected processReconcileManualSwapped(): void {
    if (this.reconcileManualSwapped()) return;
    this.reconcileManualSwapped.set(true);
    this.reconcileManualSwappedResult.set(null);
    this.facade
      .reconcileManualSwapped()
      .pipe(finalize(() => this.reconcileManualSwapped.set(false)))
      .subscribe({ next: (r) => this.reconcileManualSwappedResult.set(r) });
  }

  protected processReconcileSalesSummaryTransactions(ignoreLookback = false): void {
    if (this.reconcilingSalesSummaryTransactions()) return;
    this.reconcilingSalesSummaryTransactions.set(true);
    this.reconcileSalesSummaryTransactionsResult.set(null);
    this.facade
      .reconcileSalesSummaryTransactions(ignoreLookback)
      .pipe(finalize(() => this.reconcilingSalesSummaryTransactions.set(false)))
      .subscribe({ next: (r) => this.reconcileSalesSummaryTransactionsResult.set(r) });
  }

  protected openCancellationReprocessDialog(): void {
    this.cancellationReprocessDialogVisible.set(true);
  }

  protected confirmCancellationReprocess(payload: CancellationReprocessPayload): void {
    if (this.reprocessingCancellations()) return;
    this.reprocessingCancellations.set(true);
    this.cancellationReprocessResult.set(null);
    this.facade
      .reprocessErpCancellations({ year: payload.year, month: payload.month })
      .pipe(finalize(() => this.reprocessingCancellations.set(false)))
      .subscribe({
        next: (r) => {
          this.cancellationReprocessResult.set(r);
          this.cancellationReprocessDialogVisible.set(false);
        },
      });
  }

  protected processReconciliationFees(): void {
    if (this.reconcilingFees()) return;
    this.reconcilingFees.set(true);
    this.reconcileFeesResult.set(null);
    this.facade
      .reconcileFees()
      .pipe(finalize(() => this.reconcilingFees.set(false)))
      .subscribe({ next: (r) => this.reconcileFeesResult.set(r) });
  }

  protected processReconcileAcquirerSaleSummary(): void {
    if (this.reconcilingAcquirerSaleSummary()) return;
    this.reconcilingAcquirerSaleSummary.set(true);
    this.reconcileAcquirerSaleSummaryResult.set(null);
    this.facade
      .reconcileAcquirerSaleSummary()
      .pipe(finalize(() => this.reconcilingAcquirerSaleSummary.set(false)))
      .subscribe({ next: (r) => this.reconcileAcquirerSaleSummaryResult.set(r) });
  }

  protected processReconcileSalesSummaryCreditOrder(): void {
    if (this.reconcilingCreditOrder()) return;
    this.reconcilingCreditOrder.set(true);
    this.reconcileSalesSummaryCreditOrderResult.set(null);
    this.facade
      .reconcileSalesSummaryCreditOrder()
      .pipe(finalize(() => this.reconcilingCreditOrder.set(false)))
      .subscribe({ next: (r) => this.reconcileSalesSummaryCreditOrderResult.set(r) });
  }

  protected reconcileBank(): void {
    if (this.reconcilingBank()) return;
    this.reconcilingBank.set(true);
    this.reconcileBankResult.set(null);
    this.facade
      .reconcilingBank()
      .pipe(finalize(() => this.reconcilingBank.set(false)))
      .subscribe({ next: (r) => this.reconcileBankResult.set(r) });
  }

  protected runFullPipeline(): void {
    this.runningPipeline.set(true);
    this.pipelineResult.set(null);
    this.fileProcessingService.runFinancialPipeline().subscribe({
      next: (r) => this.pipelineResult.set(r),
      error: () => this.runningPipeline.set(false),
      complete: () => this.runningPipeline.set(false),
    });
  }
}
