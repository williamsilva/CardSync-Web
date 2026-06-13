import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { AuditDashboardApiService } from '@features/service/audit-dashboard.api.service';
import { AuditSalesSummaryModel, AuditUnreconciledModel } from '@models/audit-dashboard.models';

@Injectable({ providedIn: 'root' })
export class AuditDashboardFacade {
  private readonly api = inject(AuditDashboardApiService);

  // ─── Sales summary ───────────────────────────────────────────────────────────

  private readonly _loading = signal(false);
  private readonly _salesSummary = signal<AuditSalesSummaryModel | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly salesSummary = this._salesSummary.asReadonly();

  loadSalesSummary(force = false): void {
    if (this._loading()) return;
    if (!force && this._salesSummary() !== null) return;

    this._loading.set(true);

    this.api
      .getSalesSummary()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (res) => this._salesSummary.set(res),
        error: () => this._salesSummary.set(null),
      });
  }

  reloadSalesSummary(): void {
    this.loadSalesSummary(true);
  }

  // ─── Unreconciled ────────────────────────────────────────────────────────────

  private readonly _unreconciledLoading = signal(false);
  private readonly _unreconciled = signal<AuditUnreconciledModel | null>(null);

  readonly unreconciledLoading = this._unreconciledLoading.asReadonly();
  readonly unreconciled = this._unreconciled.asReadonly();

  loadUnreconciled(force = false): void {
    if (this._unreconciledLoading()) return;
    if (!force && this._unreconciled() !== null) return;

    this._unreconciledLoading.set(true);

    this.api
      .getUnreconciled()
      .pipe(finalize(() => this._unreconciledLoading.set(false)))
      .subscribe({
        next: (res) => this._unreconciled.set(res),
        error: () => this._unreconciled.set(null),
      });
  }

  reloadUnreconciled(): void {
    this.loadUnreconciled(true);
  }
}
