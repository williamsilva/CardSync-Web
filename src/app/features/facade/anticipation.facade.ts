import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { AnticipationApiModel } from '@models/anticipation.model';
import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { AnticipationAdvancedFilters } from '@features/filter/anticipation.filters';
import { AnticipationApiService } from '@features/service/anticipation.api.service';

type LastQuery = ListQueryDto<AnticipationAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class AnticipationFacade {
  private readonly api = inject(AnticipationApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _totalsLoading = signal(false);

  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _data = signal<AnticipationApiModel[]>([]);
  private readonly _totals = signal<TransactionsTotalsModel | null>(null);

  readonly sales = this._data.asReadonly();
  readonly totals = this._totals.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly totalsLoading = this._totalsLoading.asReadonly();

  loadPage(q: LastQuery): void {
    if (this._loading()) return;

    this._loading.set(true);
    this._lastQuery.set(q);

    this.api
      .searchPaged(q)
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

  calculateTotals(q = this._lastQuery()): void {
    if (!q || this._totalsLoading()) return;

    this._totalsLoading.set(true);

    this.api
      .calculateTotals(q)
      .pipe(finalize(() => this._totalsLoading.set(false)))
      .subscribe({
        next: (totals) => this._totals.set(totals),
        error: () => this._totals.set(null),
      });
  }

  clearTotals(): void {
    this._totals.set(null);
  }
}
