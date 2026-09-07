import { Injectable, inject, signal } from '@angular/core';

import { finalize, Observable, tap } from 'rxjs';

import { ListQueryDto } from '@williamsilva/nimbus-web-commons';
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

  /**
   * Sem marcar `_loading` aqui: esse signal é o guard de `loadPage()`, e o `finalize` externo
   * resetava `_loading` assim que a própria requisição completava, mesmo com o `reloadLast()` do
   * `tap` ainda em andamento - mesmo fix aplicado em WorksFacade/SuppliersFacade no NimbusFlow.
   */
  create(input: ContractCreateInput): Observable<ContractModel> {
    return this.api.create(input).pipe(tap(() => this.reloadLast()));
  }

  update(id: string, input: ContractUpdateInput): Observable<ContractModel> {
    return this.api.update(id, input).pipe(tap(() => this.reloadLast()));
  }

  validity(id: string): Observable<void> {
    return this.api.validity(id).pipe(tap(() => this.reloadLast()));
  }

  expired(id: string): Observable<void> {
    return this.api.expired(id).pipe(tap(() => this.reloadLast()));
  }

  closed(id: string): Observable<void> {
    return this.api.closed(id).pipe(tap(() => this.reloadLast()));
  }

  closedBulk(ids: string[]): Observable<void> {
    return this.api.closedBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  validityBulk(ids: string[]): Observable<void> {
    return this.api.validityBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  expiredBulk(ids: string[]): Observable<void> {
    return this.api.expiredBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }
}
