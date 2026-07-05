import { RouterLink } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressBarModule } from 'primeng/progressbar';

import { CsTagComponent } from '@shared/ui';
import { CsCurrencyPipe } from '@shared/pipes/cs-currency.pipe';
import { ConciliationDashboardModel } from '@models/conciliation.models';
import { ConciliationService } from '@features/service/conciliation.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';

@Component({
  standalone: true,
  selector: 'cs-conciliation-dashboard',
  styleUrl: './conciliation-dashboard.component.scss',
  templateUrl: './conciliation-dashboard.component.html',
  imports: [
    RouterLink,
    CardModule,
    ButtonModule,
    CsCurrencyPipe,
    CsTagComponent,
    SkeletonModule,
    TranslateModule,
    ProgressBarModule,
    PageHeaderComponent,
  ],
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
}
