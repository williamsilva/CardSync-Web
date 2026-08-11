import { Injectable, inject, signal } from '@angular/core';

import { Observable, finalize, tap } from 'rxjs';

import { SelectOption } from '@models/select-option.model';
import { UsersAdvancedFilters } from '@features/filter/users.filters';
import { UsersApiService } from '@features/service/users.api.service';
import { ListQueryDto } from '@shared/features/list-query/list-query.types';
import { UserCreateInput, UserModel, UserUpdateInput } from '@models/users.models';

type LastQuery = ListQueryDto<UsersAdvancedFilters>;

@Injectable({ providedIn: 'root' })
export class UsersFacade {
  private readonly api = inject(UsersApiService);

  private readonly _total = signal(0);
  private readonly _loading = signal(false);
  private readonly _loadedOnce = signal(false);
  private readonly _data = signal<UserModel[]>([]);
  private readonly _optionsLoading = signal(false);
  private readonly _optionsLoadedOnce = signal(false);
  private readonly _lastQuery = signal<LastQuery | null>(null);
  private readonly _options = signal<SelectOption<string>[]>([]);

  readonly users = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly options = this._options.asReadonly();
  readonly totalRecords = this._total.asReadonly();
  readonly loadedOnce = this._loadedOnce.asReadonly();

  loadUsersOptions(force = false): void {
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
        next: (list) => {
          this._options.set(
            (list ?? []).map((g) => ({
              label: g.name,
              value: g.id,
            })),
          );
        },
        error: () => {
          this._options.set([]);
        },
      });
  }

  loadUsersOptionsFilter(force = false): void {
    if (this._optionsLoading()) return;
    if (!force && this._optionsLoadedOnce()) return;

    this._optionsLoading.set(true);

    this.api
      .getOptionsFilter()
      .pipe(
        finalize(() => {
          this._optionsLoading.set(false);
          this._optionsLoadedOnce.set(true);
        }),
      )
      .subscribe({
        next: (list) => {
          this._options.set(
            (list ?? []).map((g) => ({
              label: g.name,
              value: g.id,
            })),
          );
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

  reloadOptions(): void {
    this._optionsLoadedOnce.set(false);
    this.loadUsersOptions(true);
  }

  resendInvite(id: string): Observable<void> {
    return this.api.resendInvite(id);
  }

  getById(id: string): Observable<UserModel> {
    return this.api.getById(id);
  }

  /**
   * Sem marcar `_loading` aqui: esse signal é o guard de `loadPage()`, e o `finalize` externo
   * resetava `_loading` assim que a própria requisição completava, mesmo com o `reloadLast()` do
   * `tap` ainda em andamento - mesmo fix aplicado em WorksFacade/SuppliersFacade no NimbusFlow.
   */
  create(input: UserCreateInput): Observable<UserModel> {
    return this.api.create(input).pipe(tap(() => this.reloadLast()));
  }

  update(id: string, input: UserUpdateInput): Observable<UserModel> {
    return this.api.update(id, input).pipe(tap(() => this.reloadLast()));
  }

  activate(id: string): Observable<void> {
    return this.api.activate(id).pipe(tap(() => this.reloadLast()));
  }

  deactivate(id: string): Observable<void> {
    return this.api.deactivate(id).pipe(tap(() => this.reloadLast()));
  }

  activateBulk(ids: string[]): Observable<void> {
    return this.api.activateBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }

  deactivateBulk(ids: string[]): Observable<void> {
    return this.api.deactivateBulk({ ids }).pipe(tap(() => this.reloadLast()));
  }
}
