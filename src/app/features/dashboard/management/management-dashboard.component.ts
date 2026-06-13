import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';

import { I18nService } from '@core/i18n/i18n.service';
import { FlagFacade } from '@features/facade/flag.facade';
import { CompanyFacade } from '@features/facade/company.facade';
import { AcquirerFacade } from '@features/facade/acquirer.facade';
import { PeriodEnum, allPeriodEnum, periodEnumLabel } from '@models/enums/period.enum';
import { PageHeaderComponent } from '@shared/features/page-header/page-header.component';
import { ManagementDashboardService } from '@features/service/management-dashboard.service';
import { ModalityEnum, allModalityEnum, modalityEnumLabel } from '@models/enums/modality.enum';
import { CsAdvancedPeriodDateFilterComponent } from '@features/list-base/cs-advanced-period-date-filter.component';
import { CsAdvancedMultiselectFilterComponent } from '@features/list-base/cs-advanced-multiselect-filter.component';
import {
  ManagementGroupBy,
  ManagementTableRow,
  ManagementFeesSection,
  ManagementChartSection,
  ManagementDebitsSection,
  ManagementDashboardModel,
  ManagementDashboardFilters,
} from '@models/management-dashboard.models';
import {
  ActiveFilterItem,
  ActiveFilterGroup,
  FiltersPanelComponent,
} from '@shared/features/filters-panel/filters-panel.component';

interface GroupByOption {
  label: string;
  value: ManagementGroupBy;
}

interface TableTotal {
  transactions: number;
  value: number;
  discount: number;
  liquid: number;
}

@Component({
  standalone: true,
  selector: 'cs-management-dashboard',
  styleUrl: './management-dashboard.component.scss',
  templateUrl: './management-dashboard.component.html',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    ButtonModule,
    SelectModule,
    TranslateModule,
    MultiSelectModule,
    ProgressBarModule,
    PageHeaderComponent,
    FiltersPanelComponent,
    CsAdvancedPeriodDateFilterComponent,
    CsAdvancedMultiselectFilterComponent,
  ],
})
export class ManagementDashboardComponent implements OnInit {
  private readonly service = inject(ManagementDashboardService);

  private readonly i18n = inject(I18nService);
  readonly companyFacade = inject(CompanyFacade);
  readonly acquirerFacade = inject(AcquirerFacade);
  readonly flagFacade = inject(FlagFacade);

  constructor() {
    effect(() => {
      this.salesGroupBy();
      this.paymentsGroupBy();
      this.feesGroupBy();
      this.debitsGroupBy();
      untracked(() => {
        this.showAllSales.set(false);
        this.showAllPayments.set(false);
        this.showAllFees.set(false);
        this.search();
      });
    });
  }

  protected readonly loading = signal(false);
  protected readonly dashboard = signal<ManagementDashboardModel | null>(null);

  protected readonly selectedCompanyIds = signal<string[] | null>(null);
  protected readonly selectedAcquirerIds = signal<string[] | null>(null);
  protected readonly selectedFlagIds = signal<string[] | null>(null);
  protected readonly selectedModalities = signal<ModalityEnum[] | null>(null);
  protected readonly filterPeriod = signal<PeriodEnum | null>(null);
  protected readonly filterDate = signal<string | string[] | null>(null);

  protected readonly periodEnumOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allPeriodEnum().map((value) => ({ label: periodEnumLabel(value, this.i18n), value }));
  });

  readonly tableFiltersState = signal<any | null>(null);
  protected readonly isDateDisabled = computed(() => !this.filterPeriod());

  protected readonly salesGroupBy = signal<ManagementGroupBy>('COMPANY');
  protected readonly feesGroupBy = signal<ManagementGroupBy>('COMPANY');
  protected readonly debitsGroupBy = signal<ManagementGroupBy>('COMPANY');
  protected readonly paymentsGroupBy = signal<ManagementGroupBy>('COMPANY');

  readonly tableActiveFilters = computed<ActiveFilterItem[]>(() =>
    this.mapTableFiltersToActiveItems(this.tableFiltersState()),
  );

  protected mapTableFiltersToActiveItems(filters: any): ActiveFilterItem[] {
    const items: ActiveFilterItem[] = [];

    return items;
  }

  readonly activeFilterGroups = computed<ActiveFilterGroup[]>(() => {
    const groups: ActiveFilterGroup[] = [];
    const advanced = this.advancedActiveFilters();
    const table = this.tableActiveFilters();

    if (advanced.length) {
      groups.push({ title: this.i18n.tUi('common.advancedFilters'), filters: advanced });
    }

    if (table.length) {
      groups.push({ title: this.i18n.tUi('common.tableFilters'), filters: table });
    }

    return groups;
  });

  readonly activeFiltersCount = computed(
    () => this.advancedActiveFilters().length + this.tableActiveFilters().length,
  );

  protected readonly groupByOptions: GroupByOption[] = [
    { label: 'Empresa', value: 'COMPANY' },
    { label: 'Adquirente', value: 'ACQUIRER' },
    { label: 'Modalidade', value: 'MODALITY' },
    { label: 'Bandeira', value: 'FLAG' },
    { label: 'Data', value: 'DATE' },
  ];

  protected readonly modalityOptions = computed(() => {
    this.i18n.getAppliedLang();
    return allModalityEnum().map((value) => ({
      label: modalityEnumLabel(value, this.i18n),
      value,
    }));
  });

  protected readonly advancedActiveFilters = computed<ActiveFilterItem[]>(() => {
    this.i18n.getAppliedLang();
    const items: ActiveFilterItem[] = [];

    const companies = this.selectedCompanyIds();
    if (companies?.length) {
      const labels = this.companyFacade
        .options()
        .filter((opt) => companies.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({
        label: this.i18n.tUi('managementDashboard.filter.company'),
        value: labels,
      });
    }

    const acquirers = this.selectedAcquirerIds();
    if (acquirers?.length) {
      const labels = this.acquirerFacade
        .options()
        .filter((opt) => acquirers.includes(opt.id))
        .map((opt) => opt.fantasyName)
        .join(', ');
      items.push({
        label: this.i18n.tUi('managementDashboard.filter.acquirer'),
        value: labels,
      });
    }

    const flags = this.selectedFlagIds();
    if (flags?.length) {
      const labels = this.flagFacade
        .options()
        .filter((opt) => flags.includes(opt.id))
        .map((opt) => opt.name)
        .join(', ');
      items.push({
        label: this.i18n.tUi('managementDashboard.filter.flag'),
        value: labels,
      });
    }

    const modalities = this.selectedModalities();
    if (modalities?.length) {
      items.push({
        label: this.i18n.tUi('managementDashboard.filter.modality'),
        value: modalities.map((v) => modalityEnumLabel(v, this.i18n)).join(', '),
      });
    }

    const period = this.filterPeriod();
    const date = this.filterDate();
    if (period && date) {
      items.push({
        label: this.i18n.tUi('managementDashboard.filter.period'),
        value: periodEnumLabel(period, this.i18n),
      });
    }

    return items;
  });

  protected readonly MAX_ROWS = 3;
  protected readonly showAllFees = signal(false);
  protected readonly showAllSales = signal(false);
  protected readonly showAllPayments = signal(false);

  protected readonly salesData = computed(() => {
    const d = this.dashboard();
    if (!d) return null;
    return this.buildBarChartData(d.sales, '#27ae60', '#1a7a4a', 'Vendas', 'A Receber');
  });

  protected readonly paymentsData = computed(() => {
    const d = this.dashboard();
    if (!d) return null;
    return this.buildBarChartData(d.payments, '#27ae60', '#1a7a4a', 'Vendas', 'Recebido');
  });

  protected readonly feesData = computed(() => {
    const d = this.dashboard();
    if (!d) return null;
    return this.buildFeesChartData(d.fees);
  });

  protected readonly debitsData = computed(() => {
    const d = this.dashboard();
    if (!d) return null;
    return this.buildDebitsChartData(d.debits);
  });

  protected readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { boxWidth: 14, font: { size: 11 } } },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => {
            const n = Number(value);
            if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
            if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
            return String(n);
          },
        },
      },
    },
  };

  protected readonly lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { boxWidth: 14, font: { size: 11 } } },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  protected readonly salesRows = computed(() => {
    const rows = this.dashboard()?.sales?.rows ?? [];
    return this.showAllSales() ? rows : rows.slice(0, this.MAX_ROWS);
  });

  protected readonly paymentsRows = computed(() => {
    const rows = this.dashboard()?.payments?.rows ?? [];
    return this.showAllPayments() ? rows : rows.slice(0, this.MAX_ROWS);
  });

  protected readonly feesRows = computed(() => {
    const rows = this.dashboard()?.fees?.rows ?? [];
    return this.showAllFees() ? rows : rows.slice(0, this.MAX_ROWS);
  });

  protected readonly salesTotal = computed(() => this.sumRows(this.dashboard()?.sales?.rows ?? []));
  protected readonly paymentsTotal = computed(() =>
    this.sumRows(this.dashboard()?.payments?.rows ?? []),
  );

  protected readonly feesTotal = computed(() => {
    const rows = this.dashboard()?.fees?.rows ?? [];
    const transactions = rows.reduce((acc, r) => acc + r.transactions, 0);
    const discount = rows.reduce((acc, r) => acc + r.discount, 0);
    const effectiveRate = rows.length
      ? rows.reduce((acc, r) => acc + r.effectiveRate, 0) / rows.length
      : 0;
    return { transactions, discount, effectiveRate };
  });

  ngOnInit(): void {
    this.companyFacade.loadCompanyOptionsFilter();
    this.acquirerFacade.loadAcquirerOptionsFilter();
    this.flagFacade.loadFlagOptionsFilter();
  }

  protected search(): void {
    if (this.loading()) return;

    const filters: ManagementDashboardFilters = {
      companyIds: this.selectedCompanyIds() ?? [],
      acquirerIds: this.selectedAcquirerIds() ?? [],
      flagIds: this.selectedFlagIds() ?? [],
      modalities: this.selectedModalities() ?? [],
      periodSaleDate: this.filterPeriod(),
      saleDate: this.filterDate(),
      groupBy: {
        sales: this.salesGroupBy(),
        payments: this.paymentsGroupBy(),
        fees: this.feesGroupBy(),
        debits: this.debitsGroupBy(),
      },
    };

    this.loading.set(true);
    this.service.getDashboard(filters).subscribe({
      next: (res) => this.dashboard.set(res),
      error: () => {
        this.dashboard.set(null);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected clear(): void {
    this.selectedCompanyIds.set(null);
    this.selectedAcquirerIds.set(null);
    this.selectedFlagIds.set(null);
    this.selectedModalities.set(null);
    this.filterPeriod.set(null);
    this.filterDate.set(null);
    this.search();
  }

  protected setViewFormat(period: PeriodEnum | null): 'date' | 'month' | 'year' {
    if (period === PeriodEnum.MONTH) return 'month';
    if (period === PeriodEnum.YEAR) return 'year';
    return 'date';
  }

  protected setDateFormat(period: PeriodEnum | null): string {
    return this.i18n.getDateFormatByPeriod(period);
  }

  protected setSelectionMode(period: PeriodEnum | null): 'single' | 'range' {
    return period === PeriodEnum.INTERVAL ? 'range' : 'single';
  }

  protected onPeriodChange(period: PeriodEnum | null): void {
    this.filterPeriod.set(period);
    this.filterDate.set(null);
  }

  protected formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  protected formatPercent(value: number): string {
    const pct = Math.round(value * 100) / 100;
    return `${pct}%`;
  }

  protected formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  private sumRows(rows: ManagementTableRow[]): TableTotal {
    return {
      transactions: rows.reduce((acc, r) => acc + r.transactions, 0),
      value: rows.reduce((acc, r) => acc + r.value, 0),
      discount: rows.reduce((acc, r) => acc + r.discount, 0),
      liquid: rows.reduce((acc, r) => acc + r.liquid, 0),
    };
  }

  private buildBarChartData(
    section: ManagementChartSection,
    primaryColor: string,
    secondaryColor: string,
    primaryLabel: string,
    secondaryLabel: string,
  ) {
    return {
      labels: section.labels,
      datasets: [
        {
          label: primaryLabel,
          data: section.primarySeries,
          backgroundColor: primaryColor,
          borderRadius: 2,
          barThickness: 26,
        },
        {
          label: secondaryLabel,
          data: section.secondarySeries,
          backgroundColor: secondaryColor,
          borderRadius: 2,
          barThickness: 26,
        },
      ],
    };
  }

  private buildFeesChartData(fees: ManagementFeesSection) {
    return {
      labels: fees.labels,
      datasets: [
        {
          label: 'Taxa Efetiva (%)',
          data: fees.effectiveRateSeries,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39,174,96,0.12)',
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#27ae60',
          pointBorderWidth: 2,
        },
        {
          label: 'Média (%)',
          data: fees.averageRateSeries,
          borderColor: '#94a3b8',
          borderDash: [6, 4],
          backgroundColor: 'transparent',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#94a3b8',
          pointBorderWidth: 2,
        },
      ],
    };
  }

  private buildDebitsChartData(debits: ManagementDebitsSection) {
    return {
      labels: debits.labels,
      datasets: [
        {
          label: 'CANCELAMENTO',
          data: debits.cancellationSeries,
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
        },
        {
          label: 'TAXAS',
          data: debits.feesSeries,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
        },
        {
          label: 'CHARGEBACK',
          data: debits.chargebackSeries,
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
        },
      ],
    };
  }
}
