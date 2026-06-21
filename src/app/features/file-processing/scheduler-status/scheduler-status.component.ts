import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { CsTagComponent } from '@shared/ui';
import { boolSeverity as getBoolSeverity } from '../file-processing-ui';
import { ScheduleStatusResponse } from '@models/file-processing.models';
import { FileProcessingService } from '@features/service/file-processing.service';
import { FinancialReconciliationPipelineResultModel } from '@models/file-processing.models';

@Component({
  standalone: true,
  selector: 'cs-scheduler-status',
  styleUrl: './scheduler-status.component.scss',
  templateUrl: './scheduler-status.component.html',
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, DividerModule, CsTagComponent],
})
export class SchedulerStatusComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly processingErp = signal(false);
  protected readonly processingRede = signal(false);
  protected readonly processingBank = signal(false);
  protected readonly runningPipeline = signal(false);

  protected readonly anyProcessing = computed(
    () =>
      this.processingErp() ||
      this.processingRede() ||
      this.processingBank() ||
      this.runningPipeline(),
  );

  protected readonly schedule = signal<ScheduleStatusResponse | null>(null);
  protected readonly pipelineResult = signal<FinancialReconciliationPipelineResultModel | null>(null);

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

  protected runFullPipeline(): void {
    this.runningPipeline.set(true);
    this.pipelineResult.set(null);
    this.service.runFinancialPipeline().subscribe({
      next: (result) => this.pipelineResult.set(result),
      error: () => this.runningPipeline.set(false),
      complete: () => this.runningPipeline.set(false),
    });
  }
}
