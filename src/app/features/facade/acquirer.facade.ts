import { computed, Injectable, inject, signal } from '@angular/core';

import { finalize, Observable, tap } from 'rxjs';

import { StatusEnum } from '@models/enums/status.enum';
import { AcquirerMinimalModel } from '@models/acquirer-minimal.models';
import { AcquirerAdvancedFilters } from '@features/filter/acquirer.filters';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { AcquirerApiService } from '@features/service/acquirer.api.service';
import { AcquirerCreateInput, AcquirerModel, AcquirerUpdateInput } from '@models/acquirer.models';

type LastQuery = ListQueryDto<AcquirerAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class AcquirerFacade {
  private readonly api = inject(AcquirerApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _optionsLoading = signal(false);
  private readonly _optionsLoadedOnce = signal(false);
  private readonly _data = signal<AcquirerModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _options = signal<AcquirerMinimalModel[]>([]);

  readonly acquirer = this._data.asReadonly();
  readonly options = this._options.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

  readonly activeOptions = computed(() =>
    this._options().filter((o) => o.status === StatusEnum.ACTIVE),
  );

  loadAcquirerOptionsFilter(force = false): void {
    if (this._optionsLoading()) return;
    if (!force && this._optionsLoadedOnce()) return;

    this._optionsLoading.set(true);

    this.api
      .getOptions()
      .pipe(
        finalize(() => {
          this._optionsLoading.set(false);
          this._optionsLoadedOnce.set(true);
        }),
      )
      .subscribe({
        next: (res) => {
          this._options.set(res?._embedded?.content ?? []);
        },
        error: () => {
          this._options.set([]);
        },
      });
  }

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

  getById(id: string): Observable<AcquirerModel> {
    return this.api.getById(id);
  }

  create(input: AcquirerCreateInput): Observable<AcquirerModel> {
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

  update(id: string, input: AcquirerUpdateInput): Observable<AcquirerModel> {
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

  block(id: string): Observable<void> {
    this._loading.set(true);
    return this.api.block(id).pipe(
      tap(() => {
        this._loading.set(false);
        this.reloadLast();
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  blockBulk(ids: string[]): Observable<void> {
    this._loading.set(true);
    return this.api.blockBulk({ ids }).pipe(
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
