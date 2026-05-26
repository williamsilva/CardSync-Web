import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressBarModule } from 'primeng/progressbar';

import { CsTagComponent } from '@shared/ui';
import { formatCurrency } from '../conciliation-ui';
import { ConciliationDashboardModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { ConciliationWaitingFacade } from '@features/facade/conciliation-waiting.facade';
import { finalize } from 'rxjs';

@Component({
  selector: 'cs-conciliation-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    TranslateModule,
    ProgressBarModule,
    CsTagComponent,
    Tooltip,
  ],
  templateUrl: './conciliation-dashboard.component.html',
  styleUrl: './conciliation-dashboard.component.scss',
})
export class ConciliationDashboardComponent {
  private readonly service = inject(ConciliationService);

  protected readonly loading = signal(false);
  protected readonly reconcilingBank = signal(false);
  protected readonly reconcilingFees = signal(false);
  protected readonly reconcilingErpVsAcquirer = signal(false);

  readonly facade = inject(ConciliationWaitingFacade);
  protected readonly dashboard = signal<ConciliationDashboardModel | null>(null);

  protected readonly summary = computed(() => this.dashboard()?.summary ?? null);
  protected readonly comparison = computed(() => this.dashboard()?.erpVsAcquirer ?? null);

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.service.getDashboard().subscribe({
      next: (response) => this.dashboard.set(response),
      error: () => {
        this.dashboard.set(null);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected progress(value?: number | null, total?: number | null): number {
    if (!value || !total || total <= 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  }

  protected processReconciliationErpVsAcquirer(): void {
    if (this.reconcilingErpVsAcquirer()) return;

    this.reconcilingErpVsAcquirer.set(true);

    this.facade
      .reconcileErpVsAcquirer()
      .pipe(finalize(() => this.reconcilingErpVsAcquirer.set(false)))
      .subscribe({
        next: () => {},
      });
  }

  protected processReconciliationFees(): void {
    if (this.reconcilingFees()) return;

    this.reconcilingFees.set(true);

    this.facade
      .reconcileFees()
      .pipe(finalize(() => this.reconcilingFees.set(false)))
      .subscribe({
        next: () => {},
      });
  }

  protected reconcileBank(): void {
    if (this.reconcilingBank()) return;

    this.facade
      .reconcilingBank()
      .pipe(finalize(() => this.reconcilingBank.set(false)))
      .subscribe({
        next: () => {},
      });
  }

  protected readonly formatCurrency = formatCurrency;
}
