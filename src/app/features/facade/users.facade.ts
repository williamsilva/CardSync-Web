import { Injectable, inject, signal } from '@angular/core';

import { Observable, finalize, tap } from 'rxjs';

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
  private readonly _lastQuery = signal<LastQuery | null>(null);

  readonly users = this._data.asReadonly();
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

  resendInvite(id: string): Observable<void> {
    return this.api.resendInvite(id);
  }

  getById(id: string): Observable<UserModel> {
    return this.api.getById(id);
  }

  create(input: UserCreateInput): Observable<UserModel> {
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

  update(id: string, input: UserUpdateInput): Observable<UserModel> {
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
