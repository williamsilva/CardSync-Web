import { Injectable, inject, signal } from '@angular/core';

import { finalize, Observable, tap } from 'rxjs';

import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { ContractAdvancedFilters } from '@features/filter/contract.filters';
import { ContractApiService } from '@features/service/contract.api.service';
import { ContractCreateInput, ContractModel, ContractUpdateInput } from '@models/contract.models';

type LastQuery = ListQueryDto<ContractAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class ContractFacade {
  private readonly api = inject(ContractApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _data = signal<ContractModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly contract = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

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

  getById(id: string): Observable<ContractModel> {
    return this.api.getById(id);
  }

  create(input: ContractCreateInput): Observable<ContractModel> {
    this._loading.set(true);
    return this.api.create(input).pipe(
      tap((created) => {
        this._loading.set(false);
        this.reloadLast();
        return created;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: string, input: ContractUpdateInput): Observable<ContractModel> {
    this._loading.set(true);
    return this.api.update(id, input).pipe(
      tap((updated) => {
        this._loading.set(false);
        this.reloadLast();
        return updated;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  validity(id: string): Observable<void> {
    this._loading.set(true);
    return this.api.validity(id).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  expired(id: string): Observable<void> {
    this._loading.set(true);
    return this.api.expired(id).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  closed(id: string): Observable<void> {
    this._loading.set(true);
    return this.api.closed(id).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  closedBulk(ids: string[]): Observable<void> {
    this._loading.set(true);
    return this.api.closedBulk({ ids }).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  validityBulk(ids: string[]): Observable<void> {
    this._loading.set(true);
    return this.api.validityBulk({ ids }).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  expiredBulk(ids: string[]): Observable<void> {
    this._loading.set(true);
    return this.api.expiredBulk({ ids }).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }
}
