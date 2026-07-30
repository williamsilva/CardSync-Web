import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { MissingErpListComponent } from '../missing-erp-list/missing-erp-list.component';
import { MissingAcquirerListComponent } from '../missing-acquirer-list/missing-acquirer-list.component';
import { ErpVsAcquirerOtherDivergencesListComponent } from '../other-divergences-list/other-divergences-list.component';

type ErpVsAcquirerTab = 'missingAcquirer' | 'missingErp' | 'otherDivergences';

const TAB_BY_VIEW_QUERY_PARAM: Record<string, ErpVsAcquirerTab> = {
  'missing-acquirer': 'missingAcquirer',
  'missing-erp': 'missingErp',
  'other-divergences': 'otherDivergences',
};

@Component({
  standalone: true,
  selector: 'cs-erp-vs-acquirer-list',
  templateUrl: './erp-vs-acquirer-list.component.html',
  imports: [
    RouterLink,
    ButtonModule,
    TranslateModule,
    PageHeaderComponent,
    MissingErpListComponent,
    MissingAcquirerListComponent,
    ErpVsAcquirerOtherDivergencesListComponent,
  ],
})
export class ErpVsAcquirerListComponent {
  private readonly route = inject(ActivatedRoute);

  @ViewChild(MissingAcquirerListComponent)
  private missingAcquirerCmp?: MissingAcquirerListComponent;

  @ViewChild(MissingErpListComponent)
  private missingErpCmp?: MissingErpListComponent;

  @ViewChild(ErpVsAcquirerOtherDivergencesListComponent)
  private otherDivergencesCmp?: ErpVsAcquirerOtherDivergencesListComponent;

  protected readonly activeTab = signal<ErpVsAcquirerTab>(
    TAB_BY_VIEW_QUERY_PARAM[this.route.snapshot.queryParamMap.get('view') ?? ''] ??
      'missingAcquirer',
  );

  protected readonly subtitleKey = computed(() => {
    switch (this.activeTab()) {
      case 'missingErp':
        return 'conciliation.pageDescription.missingErp';
      case 'otherDivergences':
        return 'conciliation.pageDescription.missingOther';
      default:
        return 'conciliation.pageDescription.missingAcquirer';
    }
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = TAB_BY_VIEW_QUERY_PARAM[params.get('view') ?? ''];
      if (tab) this.activeTab.set(tab);
    });
  }

  protected refresh(): void {
    this.missingAcquirerCmp?.refresh();
    this.missingErpCmp?.refresh();
    this.otherDivergencesCmp?.refresh();
  }
}
