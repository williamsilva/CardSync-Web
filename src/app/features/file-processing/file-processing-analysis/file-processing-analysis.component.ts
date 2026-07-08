import { Component, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagTone } from '@shared/ui';
import { CsTagComponent } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { ProcessedFileModel } from '@models/file-processing.models';
import { FileProcessingService } from '@features/service/file-processing.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { fileStatusSeverity } from '../file-processing-ui';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'cs-file-processing-analysis',
  styleUrl: './file-processing-analysis.component.scss',
  templateUrl: './file-processing-analysis.component.html',
  imports: [
    CsDatePipe,
    CardModule,
    ButtonModule,
    CsTagComponent,
    TranslateModule,
    PageHeaderComponent,
  ],
})
export class FileProcessingAnalysisComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly files = signal<ProcessedFileModel[]>([]);
  protected readonly expandedIds = signal<Set<string>>(new Set());

  protected readonly fileStatusSeverity = fileStatusSeverity;

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service
      .searchFilesPaged({ page: 0, size: 50, sort: [{ field: 'dateImport', order: -1 }] })
      .subscribe({
        next: (res) => this.files.set((res?._embedded?.content ?? []) as ProcessedFileModel[]),
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }

  protected toggleFile(id: string): void {
    const next = new Set(this.expandedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.expandedIds.set(next);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected formatDuration(startedAt?: string | null, finishedAt?: string | null): string {
    if (!startedAt || !finishedAt) return '—';
    const seconds = Math.round(
      (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000,
    );
    if (seconds < 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (h > 0 || m > 0) parts.push(`${m}min`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  protected groupTone(group?: string | null): CsTagTone {
    switch (group?.toUpperCase()) {
      case 'ERP':
        return 'success';
      case 'ADQ':
      case 'REDE':
        return 'info';
      case 'BANK':
      case 'CNAB':
        return 'secondary';
      default:
        return 'secondary';
    }
  }
}
