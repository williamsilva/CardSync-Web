import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { TransactionsAcqInstallmentModel } from '@models/transactions-acq-installment.models';
import { TransactionsAcqInstallmentApiService } from '@features/service/transaction-acq-installment.api.service';
import { TransactionsAcqInstallmentAdvancedFilters } from '@features/filter/transaction-acq-installment.filters';

type LastQuery = ListQueryDto<TransactionsAcqInstallmentAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class TransactionsAcqInstallmentFacade {
  private readonly api = inject(TransactionsAcqInstallmentApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _data = signal<TransactionsAcqInstallmentModel[]>([]);

  readonly loading = this._loading.asReadonly();
  readonly installments = this._data.asReadonly();
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
