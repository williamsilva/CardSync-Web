import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';

import { ConciliationDashboardModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { formatCurrency } from '../conciliation-ui';
import { CsTagComponent } from '@shared/ui';

@Component({
  selector: 'cs-conciliation-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, ProgressBarModule, CsTagComponent],
  templateUrl: './conciliation-dashboard.component.html',
  styleUrl: './conciliation-dashboard.component.scss',
})
export class ConciliationDashboardComponent {
  private readonly service = inject(ConciliationService);

  protected readonly loading = signal(false);
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

  protected readonly formatCurrency = formatCurrency;
}
