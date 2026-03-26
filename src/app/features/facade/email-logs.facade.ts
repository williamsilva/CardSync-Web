import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { EmailLogModel } from '../models/email-log.models';
import { SelectOption } from '@models/select-option.model';
import { EmailLogsService } from '../service/email-logs.service';
import { EmailLogsFilters } from '@features/filter/email-logs.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';

type LastQuery = ListQueryDto<EmailLogsFilters>;

@Injectable({ providedIn: 'root' })
export class EmailLogsFacade {
  private readonly api = inject(EmailLogsService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _optionsLoading = signal(false);
  private readonly _optionsLoadedOnce = signal(false);
  private readonly _data = signal<EmailLogModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _options = signal<SelectOption<string>[]>([]);

  readonly emailLogs = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

  readonly options = this._options.asReadonly();
  readonly optionsLoading = this._optionsLoading.asReadonly();
  readonly optionsLoadedOnce = this._optionsLoadedOnce.asReadonly();

  loadPage(q: LastQuery): void {
    if (this._loading()) return;

    this._loading.set(true);
    this._lastQuery.set(q);

    this.api
      .searchPaged(q)
      .pipe(
        finalize(() => {
          this._loading.set(false);
          this._loadedOnce.set(true);
        }),
      )
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
    const last = this._lastQuery();
    if (!last) return;

    this.loadPage(last);
  }
}
