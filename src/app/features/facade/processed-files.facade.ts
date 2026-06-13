import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { ProcessedFileModel } from '@models/file-processing.models';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { FileProcessingService } from '@features/service/file-processing.service';
import { ProcessedFilesAdvancedFilters } from '@features/filter/processed-files.filters';

type LastQuery = ListQueryDto<ProcessedFilesAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class ProcessedFilesFacade {
  private readonly api = inject(FileProcessingService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _data = signal<ProcessedFileModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly items = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();

  loadPage(q: LastQuery): void {
    if (this._loading()) return;

    this._loading.set(true);
    this._lastQuery.set(q);

    this.api
      .searchFilesPaged(q)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (res) => {
          this._data.set(res?._embedded?.content ?? []);
          this._total.set(res?.page?.totalElements ?? 0);
        },
        error: () => {
          this._data.set([]);
          this._total.set(0);
        },
      });
  }

  reloadLast(): void {
    const q = this._lastQuery();
    if (q) this.loadPage(q);
  }
}
