import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { PERMISSIONS } from '@core/auth/permissions.constants';
import { PermissionService } from '@core/auth/permission.service';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ManualAdjustmentComponent } from '../manual-adjustment/manual-adjustment.component';
import { ManualCreditOrderComponent } from '../manual-credit-order/manual-credit-order.component';
import { ManualSalesSummaryComponent } from '../manual-sales-summary/manual-sales-summary.component';
import { ManualBankStatementComponent } from '../manual-bank-statement/manual-bank-statement.component';
import { ManualBankReconciliationComponent } from '../manual-bank-reconciliation/manual-bank-reconciliation.component';

type ManualConciliationTab =
  | 'manualSalesSummary'
  | 'manualCreditOrder'
  | 'manualBankStatement'
  | 'manualAdjustment'
  | 'manualBankReconciliation';

const TAB_ORDER: ManualConciliationTab[] = [
  'manualSalesSummary',
  'manualCreditOrder',
  'manualBankStatement',
  'manualAdjustment',
  'manualBankReconciliation',
];

const TAB_BY_VIEW_QUERY_PARAM: Record<string, ManualConciliationTab> = {
  'manual-sales-summary': 'manualSalesSummary',
  'manual-credit-order': 'manualCreditOrder',
  'manual-bank-statement': 'manualBankStatement',
  'manual-adjustment': 'manualAdjustment',
  'manual-bank-reconciliation': 'manualBankReconciliation',
};

@Component({
  standalone: true,
  selector: 'cs-manual-conciliation',
  templateUrl: './manual-conciliation.component.html',
  imports: [
    RouterLink,
    ButtonModule,
    TranslateModule,
    PageHeaderComponent,
    ManualAdjustmentComponent,
    ManualCreditOrderComponent,
    ManualSalesSummaryComponent,
    ManualBankStatementComponent,
    ManualBankReconciliationComponent,
  ],
})
export class ManualConciliationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly perms = inject(PermissionService);

  @ViewChild(ManualCreditOrderComponent)
  private manualCreditOrderCmp?: ManualCreditOrderComponent;

  @ViewChild(ManualBankReconciliationComponent)
  private manualBankReconciliationCmp?: ManualBankReconciliationComponent;

  protected readonly canFileProcessingTabs = computed(() =>
    this.perms.hasSupportOrAny(PERMISSIONS.FILE_PROCESSING.PROCESS),
  );

  protected readonly canManualBankReconciliation = computed(() =>
    this.perms.hasSupportOrAny(PERMISSIONS.CONCILIATION.MANUAL_BANK_RECONCILIATION),
  );

  protected readonly activeTab = signal<ManualConciliationTab>(this.resolveInitialTab());

  protected readonly subtitleKey = computed(() => {
    switch (this.activeTab()) {
      case 'manualCreditOrder':
        return 'conciliation.manualCreditOrder.subtitle';
      case 'manualBankStatement':
        return 'conciliation.manualBankStatement.subtitle';
      case 'manualAdjustment':
        return 'conciliation.manualAdjustment.subtitle';
      case 'manualBankReconciliation':
        return 'conciliation.manualBankReconciliation.subtitle';
      default:
        return 'conciliation.manualSalesSummary.subtitle';
    }
  });

  protected readonly canRefreshActiveTab = computed(() => {
    const tab = this.activeTab();
    return tab === 'manualCreditOrder' || tab === 'manualBankReconciliation';
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = TAB_BY_VIEW_QUERY_PARAM[params.get('view') ?? ''];
      if (tab && this.isTabAccessible(tab)) this.activeTab.set(tab);
    });
  }

  protected isTabAccessible(tab: ManualConciliationTab): boolean {
    return tab === 'manualBankReconciliation'
      ? this.canManualBankReconciliation()
      : this.canFileProcessingTabs();
  }

  protected refresh(): void {
    this.manualCreditOrderCmp?.refresh();
    this.manualBankReconciliationCmp?.refresh();
  }

  private resolveInitialTab(): ManualConciliationTab {
    const requested = TAB_BY_VIEW_QUERY_PARAM[this.route.snapshot.queryParamMap.get('view') ?? ''];

    if (requested && this.isTabAccessible(requested)) {
      return requested;
    }

    return TAB_ORDER.find((tab) => this.isTabAccessible(tab)) ?? 'manualSalesSummary';
  }
}
