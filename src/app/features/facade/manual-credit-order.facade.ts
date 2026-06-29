import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { SaleSummaryApiModel } from '@models/sales-summary.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { SaleSummaryAdvancedFilters } from '@features/filter/sale-summary.filters';
import { SaleSummaryApiService } from '@features/service/sales-summary.api.service';

type LastQuery = ListQueryDto<SaleSummaryAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class ManualCreditOrderFacade {
  private readonly api = inject(SaleSummaryApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _data = signal<SaleSummaryApiModel[]>([]);

  readonly rows = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();

  loadPage(q: LastQuery): void {
    if (this._loading()) return;

    this._loading.set(true);
    this._lastQuery.set(q);

    this.api
      .getPendingCreditOrders(q)
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
