import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { STATE_KEY } from '@features/state-key.constants';
import { AuditDashboardFacade } from '@features/facade/audit-dashboard.facade';
import { AuditUnreconciledAcquirer, AuditUnreconciledDetail } from '@models/audit-dashboard.models';
import {
  ConciliationWaitingFiltersState,
  createEmptyConciliationWaitingFiltersState,
} from '@features/filter/conciliation-waiting.filter';

interface AuditLastImport {
  name: string;
  date: string | null;
}

interface AuditContestable {
  name: string;
  count: number;
}

interface AuditFileEntry {
  name: string;
  date: string;
  hasAlert: boolean;
}

interface AuditFileGroup {
  category: string;
  files: AuditFileEntry[];
}

@Component({
  standalone: true,
  selector: 'cs-audit-dashboard',
  styleUrl: './audit-dashboard.component.scss',
  templateUrl: './audit-dashboard.component.html',
  imports: [CommonModule, TranslateModule],
})
export class AuditDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly facade = inject(AuditDashboardFacade);

  // ─── Sales summary ───────────────────────────────────────────────────────────

  protected readonly loading = this.facade.loading;

  protected readonly salesSummary = computed(() => this.facade.salesSummary()?.summary ?? []);

  protected readonly acquirerDetails = computed(
    () => this.facade.salesSummary()?.acquirerDetails ?? [],
  );

  protected readonly showAcquirerDetail = signal(false);

  // ─── Unreconciled ────────────────────────────────────────────────────────────

  protected readonly unreconciledLoading = this.facade.unreconciledLoading;

  protected readonly unreconciledAcquirers = computed(
    () => this.facade.unreconciled()?.acquirers ?? [],
  );

  protected readonly unreconciledTotal = computed(() => this.facade.unreconciled()?.total ?? 0);

  protected readonly expandedAcquirerId = signal<number | null>(null);

  // ─── Other cards (mock — connect to server as available) ─────────────────────

  protected readonly lastImports = signal<AuditLastImport[]>([
    { name: 'ERP', date: '16/12/2025 15:55:00' },
    { name: 'Cielo', date: null },
    { name: 'Rede', date: '16/12/2025 15:52:08' },
    { name: 'Itau', date: '16/12/2025 15:52:08' },
    { name: 'Santander', date: '16/12/2025 15:52:08' },
  ]);

  protected readonly contestable = signal<AuditContestable[]>([
    { name: 'Rede S/A', count: 0 },
    { name: 'Cielo S/A', count: 0 },
    { name: 'Outra', count: 0 },
  ]);

  protected readonly fileGroups = signal<AuditFileGroup[]>([
    {
      category: 'ADQ',
      files: [{ name: 'Rede', date: '16/12/2025 15:52:08', hasAlert: false }],
    },
    {
      category: 'BANK',
      files: [
        { name: 'Itau', date: '16/12/2025 15:52:08', hasAlert: true },
        { name: 'Santander', date: '16/12/2025 15:52:08', hasAlert: true },
        { name: 'Bradesco', date: '16/12/2025 15:52:08', hasAlert: true },
        { name: 'Itau', date: '16/12/2025 15:52:08', hasAlert: true },
        { name: 'Santander', date: '16/12/2025 15:23:38', hasAlert: true },
      ],
    },
    {
      category: 'ERP',
      files: [{ name: 'ERP', date: '16/12/2025 15:55:00', hasAlert: false }],
    },
  ]);

  protected readonly fileStatsToday = signal(0);
  protected readonly fileStatsLast7 = signal(0);
  protected readonly fileStatsYesterday = signal(0);

  ngOnInit(): void {
    this.facade.loadSalesSummary();
    this.facade.loadUnreconciled();
  }

  protected toggleAcquirerDetail(): void {
    this.showAcquirerDetail.set(!this.showAcquirerDetail());
  }

  protected toggleUnreconciled(acquirerId: number): void {
    this.expandedAcquirerId.set(this.expandedAcquirerId() === acquirerId ? null : acquirerId);
  }

  protected reloadSalesSummary(): void {
    this.facade.reloadSalesSummary();
  }

  protected reloadUnreconciled(): void {
    this.facade.reloadUnreconciled();
  }

  protected unreconciledCountLabel(count: number): string {
    const total = this.unreconciledTotal();
    return total > 0 ? `${count} de ${total}` : String(count);
  }

  protected navigateToMissingAcq(
    d: AuditUnreconciledDetail,
    item: AuditUnreconciledAcquirer,
  ): void {
    const filters = this.buildMissingFilters(d, item);
    localStorage.setItem(
      STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ERP.FILTERS.V1,
      JSON.stringify(filters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ERP.TABLE.STATE.V1);
    this.openRouteInNewTab(['/conciliation/erp-vs-acquirer/missing-erp']);
  }

  protected navigateToMissingErp(
    d: AuditUnreconciledDetail,
    item: AuditUnreconciledAcquirer,
  ): void {
    const filters = this.buildMissingFilters(d, item);
    localStorage.setItem(
      STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ACQ.FILTERS.V1,
      JSON.stringify(filters),
    );
    localStorage.removeItem(STATE_KEY.CARDSYNC.CONCILIATION.MISSING.ACQ.TABLE.STATE.V1);
    this.openRouteInNewTab(['/conciliation/erp-vs-acquirer/missing-acquirer']);
  }

  private buildMissingFilters(
    d: AuditUnreconciledDetail,
    item: AuditUnreconciledAcquirer,
  ): ConciliationWaitingFiltersState {
    return {
      ...createEmptyConciliationWaitingFiltersState(),
      acquirers: [String(item.acquirerId)],
      saleDate: d.date,
      periodSaleDate: PeriodEnum.DAY,
    };
  }

  private openRouteInNewTab(commands: unknown[]): void {
    const url = this.router.serializeUrl(this.router.createUrlTree(commands));
    window.open(`${window.location.origin}${url}`, '_blank', 'noopener,noreferrer');
  }

  protected isMaxInRow(value: number, d: AuditUnreconciledDetail): boolean {
    if (value === 0) return false;
    return value === Math.max(d.erpAcq, d.onlyInErp, d.onlyInAcquirer);
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
