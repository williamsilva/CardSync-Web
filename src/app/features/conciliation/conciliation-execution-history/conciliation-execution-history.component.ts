import { Component, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { CsTagComponent } from '@shared/ui';
import { CsDatePipe } from '@shared/pipes/cs-date.pipe';
import { ReconciliationExecutionLogModel } from '@models/file-processing.models';
import { FileProcessingService } from '@features/service/file-processing.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

type Tone = 'success' | 'danger' | 'warn' | 'info' | 'secondary';

@Component({
  standalone: true,
  providers: [CsDatePipe],
  selector: 'cs-conciliation-execution-history',
  styleUrl: './conciliation-execution-history.component.scss',
  templateUrl: './conciliation-execution-history.component.html',
  imports: [
    CardModule,
    CsDatePipe,
    ButtonModule,
    CsTagComponent,
    TranslateModule,
    PageHeaderComponent,
  ],
})
export class ConciliationExecutionHistoryComponent {
  private readonly fileProcessingService = inject(FileProcessingService);

  protected readonly loading = signal(false);
  protected readonly expandedExecs = signal<Set<string>>(new Set());
  protected readonly history = signal<ReconciliationExecutionLogModel[]>([]);

  constructor() {
    this.loadHistory();
  }

  protected loadHistory(): void {
    this.loading.set(true);
    this.fileProcessingService.getReconciliationHistory(50).subscribe({
      next: (items) => this.history.set(items),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected toggleExec(id: string): void {
    const next = new Set(this.expandedExecs());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.expandedExecs.set(next);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedExecs().has(id);
  }

  protected formatDuration(startedAt?: string | null, finishedAt?: string | null): string {
    if (!startedAt || !finishedAt) return '-';
    const seconds = Math.round(
      (new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000,
    );
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (h > 0 || m > 0) parts.push(`${m}min`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  protected overallStatusTone(status: string): Tone {
    if (status === 'SUCCESS') return 'success';
    if (status === 'FAILED') return 'danger';
    return 'warn';
  }

  protected stepStatusTone(status: string): Tone {
    if (status === 'COMPLETED') return 'success';
    if (status === 'FAILED') return 'danger';
    if (status === 'BLOCKED') return 'warn';
    if (status === 'SKIPPED') return 'secondary';
    return 'info';
  }

  protected triggerTone(trigger: string): Tone {
    return trigger === 'MANUAL' ? 'info' : 'secondary';
  }
}
