import { Injectable, inject, signal } from '@angular/core';

import { finalize, Observable, tap } from 'rxjs';

import { NoFileDayModel, NoFileDayCreateInput, NoFileDayUpdateInput } from '@models/no-file-day.models';
import { NoFileDayAdvancedFilters } from '@features/filter/no-file-day.filters';
import { NoFileDayApiService } from '@features/service/no-file-day.api.service';
import { ListQueryDto } from '@williamsilva/nimbus-web-commons';

type LastQuery = ListQueryDto<NoFileDayAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class NoFileDayFacade {
  private readonly api = inject(NoFileDayApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _data = signal<NoFileDayModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly noFileDays = this._data.asReadonly();
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

  getById(id: string): Observable<NoFileDayModel> {
    return this.api.getById(id);
  }

  /**
   * Sem marcar `_loading` aqui: esse signal é o guard de `loadPage()`, e o `finalize` externo
   * resetava `_loading` assim que a própria requisição completava, mesmo com o `reloadLast()` do
   * `tap` ainda em andamento - mesmo fix aplicado em WorksFacade/SuppliersFacade no NimbusFlow.
   */
  create(input: NoFileDayCreateInput): Observable<NoFileDayModel> {
    return this.api.create(input).pipe(tap(() => this.reloadLast()));
  }

  update(id: string, input: NoFileDayUpdateInput): Observable<NoFileDayModel> {
    return this.api.update(id, input).pipe(tap(() => this.reloadLast()));
  }

  activate(id: string): Observable<void> {
    return this.api.activate(id).pipe(tap(() => this.reloadLast()));
  }

  deactivate(id: string): Observable<void> {
    return this.api.deactivate(id).pipe(tap(() => this.reloadLast()));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(id).pipe(tap(() => this.reloadLast()));
  }

  activateBulk(ids: string[]): Observable<void> {
    return this.api.activateBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  deactivateBulk(ids: string[]): Observable<void> {
    return this.api.deactivateBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  deleteBulk(ids: string[]): Observable<void> {
    return this.api.deleteBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }
}
