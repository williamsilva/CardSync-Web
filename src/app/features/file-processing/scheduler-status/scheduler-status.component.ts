import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { CsTagComponent } from '@shared/ui';
import { boolSeverity as getBoolSeverity } from '../file-processing-ui';
import { ScheduleStatusResponse } from '@models/file-processing.models';
import { FileProcessingService } from '@features/service/file-processing.service';
import { ConciliationWaitingApiService } from '@features/service/conciliation-waiting.api.service';
import {
  ReconcileBankResultModel,
  ReconcileErpAcquirerResultModel,
} from '@models/conciliation-waiting.model';

@Component({
  standalone: true,
  selector: 'cs-scheduler-status',
  styleUrl: './scheduler-status.component.scss',
  templateUrl: './scheduler-status.component.html',
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, DividerModule, CsTagComponent],
})
export class SchedulerStatusComponent {
  private readonly service = inject(FileProcessingService);
  private readonly conciliationService = inject(ConciliationWaitingApiService);

  protected readonly loading = signal(false);
  protected readonly processingErp = signal(false);
  protected readonly processingRede = signal(false);
  protected readonly processingBank = signal(false);
  protected readonly reconcilingBank = signal(false);
  protected readonly reconcilingErpAcq = signal(false);

  protected readonly schedule = signal<ScheduleStatusResponse | null>(null);
  protected readonly reconcileBankResult = signal<ReconcileBankResultModel | null>(null);
  protected readonly reconcileErpAcqResult = signal<ReconcileErpAcquirerResultModel | null>(null);

  protected readonly boolSeverity = getBoolSeverity;

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service.getScheduleStatus().subscribe({
      next: (status) => this.schedule.set(status),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected processErp(): void {
    this.processingErp.set(true);
    this.service.processErp().subscribe({
      next: () => this.reload(),
      error: () => this.processingErp.set(false),
      complete: () => this.processingErp.set(false),
    });
  }

  protected processRede(): void {
    this.processingRede.set(true);
    this.service.processRede().subscribe({
      next: () => this.reload(),
      error: () => this.processingRede.set(false),
      complete: () => this.processingRede.set(false),
    });
  }

  protected processBank(): void {
    this.processingBank.set(true);
    this.service.processBank().subscribe({
      next: () => this.reload(),
      error: () => this.processingBank.set(false),
      complete: () => this.processingBank.set(false),
    });
  }

  protected reconcileBank(): void {
    this.reconcilingBank.set(true);
    this.reconcileBankResult.set(null);
    this.conciliationService.reconcilingBank().subscribe({
      next: (result) => this.reconcileBankResult.set(result),
      error: () => this.reconcilingBank.set(false),
      complete: () => this.reconcilingBank.set(false),
    });
  }

  protected reconcileErpAcq(): void {
    this.reconcilingErpAcq.set(true);
    this.reconcileErpAcqResult.set(null);
    this.conciliationService.reconcileErpVsAcquirer().subscribe({
      next: (result) => this.reconcileErpAcqResult.set(result),
      error: () => this.reconcilingErpAcq.set(false),
      complete: () => this.reconcilingErpAcq.set(false),
    });
  }
}
