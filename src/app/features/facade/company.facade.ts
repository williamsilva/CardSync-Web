import { computed, Injectable, inject, signal } from '@angular/core';

import { finalize, Observable, tap } from 'rxjs';

import { StatusEnum } from '@models/enums/status.enum';
import { CompanyMinimalModel } from '@models/company-minimal.models';
import { CompanyAdvancedFilters } from '@features/filter/company.filters';
import { CompanyApiService } from '@features/service/company.api.service';
import { ListQueryDto } from '@williamsilva/nimbus-web-commons';
import { CompanyCreateInput, CompanyModel, CompanyUpdateInput } from '@models/company.models';

type LastQuery = ListQueryDto<CompanyAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class CompanyFacade {
  private readonly api = inject(CompanyApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _optionsLoading = signal(false);
  private readonly _optionsLoadedOnce = signal(false);
  private readonly _data = signal<CompanyModel[]>([]);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _options = signal<CompanyMinimalModel[]>([]);

  readonly company = this._data.asReadonly();
  readonly options = this._options.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();
  readonly optionsLoadedOnce = this._optionsLoadedOnce.asReadonly();

  readonly activeOptions = computed(() =>
    this._options().filter((o) => o.status === StatusEnum.ACTIVE),
  );

  loadCompanyOptionsFilter(force = false): void {
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

  getById(id: string): Observable<CompanyModel> {
    return this.api.getById(id);
  }

  /**
   * Sem marcar `_loading` aqui: esse signal é o guard de `loadPage()`, e o `finalize` externo
   * resetava `_loading` assim que a própria requisição completava, mesmo com o `reloadLast()` do
   * `tap` ainda em andamento - mesmo fix aplicado em WorksFacade/SuppliersFacade no NimbusFlow.
   */
  create(input: CompanyCreateInput): Observable<CompanyModel> {
    return this.api.create(input).pipe(tap(() => this.reloadLast()));
  }

  update(id: string, input: CompanyUpdateInput): Observable<CompanyModel> {
    return this.api.update(id, input).pipe(tap(() => this.reloadLast()));
  }

  activate(id: string): Observable<void> {
    return this.api.activate(id).pipe(tap(() => this.reloadLast()));
  }

  deactivate(id: string): Observable<void> {
    return this.api.deactivate(id).pipe(tap(() => this.reloadLast()));
  }

  block(id: string): Observable<void> {
    return this.api.block(id).pipe(tap(() => this.reloadLast()));
  }

  blockBulk(ids: string[]): Observable<void> {
    return this.api.blockBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  activateBulk(ids: string[]): Observable<void> {
    return this.api.activateBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  deactivateBulk(ids: string[]): Observable<void> {
    return this.api.deactivateBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }
}
