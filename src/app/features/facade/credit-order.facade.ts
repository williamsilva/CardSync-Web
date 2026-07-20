import { Injectable, inject, signal } from '@angular/core';

import { finalize, Observable } from 'rxjs';

import { TransactionsTotalsModel } from '@models/transactionsTotalsModel';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { CreditOrderAdvancedFilters } from '@features/filter/credit-order.filters';
import { CreditOrderApiService } from '@features/service/credit-order.api.service';
import {
  CreditOrderApiModel,
  CreditOrderManualInput,
  CreditOrderManualResult,
} from '@models/credit-order.model';

type LastQuery = ListQueryDto<CreditOrderAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class CreditOrderFacade {
  private readonly api = inject(CreditOrderApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _totalsLoading = signal(false);

  private readonly _data = signal<CreditOrderApiModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);
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

  createManual(input: CreditOrderManualInput): Observable<CreditOrderManualResult> {
    return this.api.createManual(input);
  }
}
