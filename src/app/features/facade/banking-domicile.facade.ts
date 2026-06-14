import { Injectable, inject, signal } from '@angular/core';

import { finalize, Observable, tap } from 'rxjs';

import { BankingDomicileAdvancedFilters } from '@features/filter/banking-domicile.filters';
import { BankingDomicileApiService } from '@features/service/banking-domicile.api.service';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import {
  BankingDomicileModel,
  BankingDomicileCreateInput,
  BankingDomicileUpdateInput,
} from '@models/banking-domicile.models';

type LastQuery = ListQueryDto<BankingDomicileAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class BankingDomicileFacade {
  private readonly api = inject(BankingDomicileApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _data = signal<BankingDomicileModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly bankingDomiciles = this._data.asReadonly();

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

  getById(id: string): Observable<BankingDomicileModel> {
    return this.api.getById(id);
  }

  create(input: BankingDomicileCreateInput): Observable<BankingDomicileModel> {
    this._loading.set(true);
    return this.api.create(input).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: string, input: BankingDomicileUpdateInput): Observable<BankingDomicileModel> {
    this._loading.set(true);
    return this.api.update(id, input).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  activate(id: string): Observable<void> {
    this._loading.set(true);
    return this.api.activate(id).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deactivate(id: string): Observable<void> {
    this._loading.set(true);
    return this.api.deactivate(id).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  activateBulk(ids: string[]): Observable<void> {
    this._loading.set(true);
    return this.api.activateBulk({ ids }).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  deactivateBulk(ids: string[]): Observable<void> {
    this._loading.set(true);
    return this.api.deactivateBulk({ ids }).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }
}
