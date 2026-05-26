import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { CsTagComponent } from '@shared/ui';
import { FileProcessingService } from '@features/service/file-processing.service';
import { ProcessedFileModel, ScheduleStatusResponse } from '@models/file-processing.models';

import {
  boolSeverity as getBoolSeverity,
  fileStatusSeverity as getFileStatusSeverity,
} from '../file-processing-ui';

@Component({
  standalone: true,
  selector: 'cs-file-processing-dashboard',
  styleUrl: './file-processing-dashboard.component.scss',
  templateUrl: './file-processing-dashboard.component.html',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
  ],
})
export class FileProcessingDashboardComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly processingErp = signal(false);
  protected readonly processingRede = signal(false);
  protected readonly processingBank = signal(false);
  protected readonly files = signal<ProcessedFileModel[]>([]);
  protected readonly schedule = signal<ScheduleStatusResponse | null>(null);

  protected readonly totals = computed(() => {
    const files = this.files();
    return {
      processed: files.filter((f) => f.status === 'PROCESSED').length,
      warnings: files.filter((f) => f.status === 'PROCESSED_WITH_WARNINGS').length,
      errors: files.filter((f) => f.status === 'ERROR').length,
      duplicate: files.filter((f) => f.status === 'DUPLICATE').length,
      pendingContract: files.reduce((sum, f) => sum + (f.pendingContractLines ?? 0), 0),
      pendingContext: files.reduce((sum, f) => sum + (f.pendingBusinessContextLines ?? 0), 0),
    };
  });

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service.listFiles({ page: 0, size: 8, sort: 'dateImport,desc' }).subscribe({
      next: (page) => this.files.set(page.content ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });

    this.service.getScheduleStatus().subscribe((status) => this.schedule.set(status));
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

  protected readonly fileStatusSeverity = getFileStatusSeverity;
  protected readonly boolSeverity = getBoolSeverity;
}
