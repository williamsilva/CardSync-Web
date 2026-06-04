import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const FILE_PROCESSING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'analytics' },
  {
    path: 'analytics',
    title: 'Processamento de Arquivos',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./file-processing-dashboard/file-processing-dashboard.component').then(
        (m) => m.FileProcessingDashboardComponent,
      ),
  },
  {
    path: 'files',
    title: 'Arquivos Processados',
    loadComponent: () =>
      import('./processed-files-list/processed-files-list.component').then(
        (m) => m.ProcessedFilesListComponent,
      ),
  },
  {
    path: 'files/:id',
    title: 'Detalhe do Arquivo',
    loadComponent: () =>
      import('./processed-file-detail/processed-file-detail.component').then(
        (m) => m.ProcessedFileDetailComponent,
      ),
  },
  {
    path: 'schedules',
    title: 'Status do Scheduler',
    loadComponent: () =>
      import('./scheduler-status/scheduler-status.component').then(
        (m) => m.SchedulerStatusComponent,
      ),
  },
  {
    path: 'erp/pending-sales',
    title: 'Vendas ERP Pendentes',
    loadComponent: () =>
      import('./erp-pending-sales/erp-pending-sales.component').then(
        (m) => m.ErpPendingSalesComponent,
      ),
  },
  {
    path: 'rede/movements',
    title: 'Movimentos Rede',
    loadComponent: () =>
      import('./rede-movements/rede-movements.component').then((m) => m.RedeMovementsComponent),
  },
  {
    path: 'rede/credit-orders',
    title: 'Ordens de Crédito Rede',
    loadComponent: () =>
      import('./rede-credit-orders/rede-credit-orders.component').then(
        (m) => m.RedeCreditOrdersComponent,
      ),
  },
  {
    path: 'rede/adjustments',
    title: 'Ajustes Rede',
    loadComponent: () =>
      import('./rede-adjustments/rede-adjustments.component').then(
        (m) => m.RedeAdjustmentsComponent,
      ),
  },

  {
    path: 'rede/pending-debts',
    title: 'Débitos Pendentes Rede',
    loadComponent: () =>
      import('./rede-pending-debts/rede-pending-debts.component').then(
        (m) => m.RedePendingDebtsComponent,
      ),
  },
  {
    path: 'rede/settled-debts',
    title: 'Débitos Liquidados Rede',
    loadComponent: () =>
      import('./rede-settled-debts/rede-settled-debts.component').then(
        (m) => m.RedeSettledDebtsComponent,
      ),
  },
  {
    path: 'rede/totalizers',
    title: 'Totalizadores Rede',
    loadComponent: () =>
      import('./rede-totalizers/rede-totalizers.component').then((m) => m.RedeTotalizersComponent),
  },
  {
    path: 'bank/releases',
    title: 'Lançamentos Bancários',
    loadComponent: () =>
      import('./bank-releases/bank-releases.component').then((m) => m.BankReleasesComponent),
  },
  {
    path: 'divergences',
    title: 'Análise de Divergências',
    loadComponent: () =>
      import('./divergence-analysis/divergence-analysis.component').then(
        (m) => m.DivergenceAnalysisComponent,
      ),
  },
];
