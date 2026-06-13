import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { BankStatementApiModel } from '@models/bank-statement.model';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { BankStatementAdvancedFilters } from '@features/filter/bank-statement.filters';
import { BankStatementApiService } from '@features/service/bank-statement.api.service';

type LastQuery = ListQueryDto<BankStatementAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class BankStatementFacade {
  private readonly api = inject(BankStatementApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _data = signal<BankStatementApiModel[]>([]);

  readonly items = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();

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
}
