import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

import { CsTagComponent } from '@shared/ui';
import { FileProcessingService } from '@features/service/file-processing.service';
import { fileStatusSeverity as getFileStatusSeverity } from '../file-processing-ui';
import {
  ProcessedFileModel,
  ProcessedFileErrorModel,
  ProcessedFileSummaryModel,
} from '@models/file-processing.models';

@Component({
  standalone: true,
  selector: 'cs-processed-file-detail',
  styleUrl: './processed-file-detail.component.scss',
  templateUrl: './processed-file-detail.component.html',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    ButtonModule,
    DividerModule,
    TooltipModule,
    CsTagComponent,
  ],
})
export class ProcessedFileDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly file = signal<ProcessedFileModel | null>(null);
  protected readonly errors = signal<ProcessedFileErrorModel[]>([]);
  protected readonly summary = signal<ProcessedFileSummaryModel | null>(null);

  protected readonly processedPercent = computed(() => {
    const s = this.summary();
    const total = s?.totalLines ?? 0;
    if (!total) return 0;
    return Math.round(((s?.processedLines ?? 0) / total) * 100);
  });

  constructor() {
    this.reload();
  }

  protected reload(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.service.getFile(id).subscribe((file) => this.file.set(file));
    this.service.getFileSummary(id).subscribe((summary) => this.summary.set(summary));
    this.service.listFileErrors(id).subscribe({
      next: (errors) => this.errors.set(errors ?? []),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected readonly fileStatusSeverity = getFileStatusSeverity;
}
