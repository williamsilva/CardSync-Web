import { RouterLink } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressBarModule } from 'primeng/progressbar';

import { CsTagComponent } from '@shared/ui';
import { formatCurrency } from '../conciliation-ui';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { PERMISSIONS } from '@core/auth/permissions.constants';
import { I18nService } from '@core/i18n/i18n.service';
import { ToastService } from '@core/toast/toast.service';
import { PermissionService } from '@core/auth/permission.service';
import { ConciliationDashboardModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { ConciliationWaitingFacade } from '@features/facade/conciliation-waiting.facade';
import {
  ReconcileBankResultModel,
  ReconcileErpAcquirerResultModel,
  ReconcileFeesResultModel,
} from '@models/conciliation-waiting.model';
import {
  CancellationReprocessDialogComponent,
  CancellationReprocessPayload,
} from './cancellation-reprocess-dialog.component';

@Component({
  standalone: true,
  selector: 'cs-conciliation-dashboard',
  styleUrl: './conciliation-dashboard.component.scss',
  templateUrl: './conciliation-dashboard.component.html',
  imports: [
    RouterLink,
    CardModule,
    ButtonModule,
    CsCurrencyPipe,
    CsTagComponent,
    TranslateModule,
    ProgressBarModule,
    CancellationReprocessDialogComponent,
  ],
})
export class ConciliationDashboardComponent {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly service = inject(ConciliationService);
  private readonly perms = inject(PermissionService);

  protected readonly canProcess = computed(() =>
    this.perms.hasSupportOr(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  protected readonly loading = signal(false);
  protected readonly reconcilingBank = signal(false);
  protected readonly reconcilingFees = signal(false);
  protected readonly reconcileManualSwapped = signal(false);
  protected readonly reconcilingErpVsAcquirer = signal(false);
  protected readonly reprocessingCancellations = signal(false);
  protected readonly cancellationReprocessDialogVisible = signal(false);

  protected readonly anyProcessing = computed(
    () =>
      this.reconcilingBank() ||
      this.reconcilingFees() ||
      this.reconcileManualSwapped() ||
      this.reconcilingErpVsAcquirer() ||
      this.reprocessingCancellations(),
  );

  protected readonly reconcileBankResult = signal<ReconcileBankResultModel | null>(null);
  protected readonly reconcileErpAcqResult = signal<ReconcileErpAcquirerResultModel | null>(null);
  protected readonly reconcileManualSwappedResult = signal<ReconcileErpAcquirerResultModel | null>(null);
  protected readonly reconcileFeesResult = signal<ReconcileFeesResultModel | null>(null);

  readonly facade = inject(ConciliationWaitingFacade);
  protected readonly dashboard = signal<ConciliationDashboardModel | null>(null);

  protected readonly summary = computed(() => this.dashboard()?.summary ?? null);
  protected readonly comparison = computed(() => this.dashboard()?.erpVsAcquirer ?? null);

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

  protected progress(value?: number | null, total?: number | null): number {
    if (!value || !total || total <= 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  }

  protected processReconciliationErpVsAcquirer(): void {
    if (this.reconcilingErpVsAcquirer()) return;
    this.reconcilingErpVsAcquirer.set(true);
    this.reconcileErpAcqResult.set(null);

    this.facade
      .reconcileErpVsAcquirer()
      .pipe(finalize(() => this.reconcilingErpVsAcquirer.set(false)))
      .subscribe({
        next: (result) => this.reconcileErpAcqResult.set(result),
      });
  }

  protected processReconcileManualSwapped(): void {
    if (this.reconcileManualSwapped()) return;
    this.reconcileManualSwapped.set(true);
    this.reconcileManualSwappedResult.set(null);

    this.facade
      .reconcileManualSwapped()
      .pipe(finalize(() => this.reconcileManualSwapped.set(false)))
      .subscribe({
        next: (result) => this.reconcileManualSwappedResult.set(result),
      });
  }

  protected processReconciliationFees(): void {
    if (this.reconcilingFees()) return;
    this.reconcilingFees.set(true);
    this.reconcileFeesResult.set(null);

    this.facade
      .reconcileFees()
      .pipe(finalize(() => this.reconcilingFees.set(false)))
      .subscribe({
        next: (result) => this.reconcileFeesResult.set(result),
      });
  }

  protected reconcileBank(): void {
    if (this.reconcilingBank()) return;
    this.reconcilingBank.set(true);
    this.reconcileBankResult.set(null);

    this.facade
      .reconcilingBank()
      .pipe(finalize(() => this.reconcilingBank.set(false)))
      .subscribe({
        next: (result) => this.reconcileBankResult.set(result),
      });
  }

  protected openCancellationReprocessDialog(): void {
    this.cancellationReprocessDialogVisible.set(true);
  }

  protected confirmCancellationReprocess(payload: CancellationReprocessPayload): void {
    if (this.reprocessingCancellations()) return;
    this.reprocessingCancellations.set(true);

    this.facade
      .reprocessErpCancellations({ year: payload.year, month: payload.month })
      .pipe(finalize(() => this.reprocessingCancellations.set(false)))
      .subscribe({
        next: (result) => {
          this.cancellationReprocessDialogVisible.set(false);
          this.toast.success(
            this.i18n.tUi('conciliation.cancellationReprocess.successTitle'),
            this.i18n.tUi('conciliation.cancellationReprocess.successDetail', {
              acq: result.acqSalesCancelled,
              erp: result.erpSalesCancelled,
              linked: result.erpLinkedBeforeCancel,
              installments: result.erpInstallmentsCancelled,
              skipped: result.skippedAlreadyCancelled,
            }),
            12000,
          );
        },
        error: () => {
          this.toast.error(
            this.i18n.tUi('conciliation.cancellationReprocess.errorTitle'),
            this.i18n.tUi('conciliation.cancellationReprocess.errorDetail'),
          );
        },
      });
  }

  protected readonly formatCurrency = formatCurrency;
}
