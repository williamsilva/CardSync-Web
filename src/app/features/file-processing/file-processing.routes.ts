import { Routes } from '@angular/router';

import { permissionGuard } from '@core/auth/permission.guard';
import { PERMISSIONS } from '@core/auth/permissions.constants';

export const FILE_PROCESSING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'analysis' },
  {
    path: 'analysis',
    title: 'Dashboard de Processamento',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./file-processing-analysis/file-processing-analysis.component').then(
        (m) => m.FileProcessingAnalysisComponent,
      ),
  },
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
    path: 'calendar',
    title: 'Agenda de Arquivos Importados',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./imported-files-calendar/imported-files-calendar.component').then(
        (m) => m.ImportedFilesCalendarComponent,
      ),
  },
  {
    path: 'files',
    title: 'Arquivos Processados',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./processed-files-list/processed-files-list.component').then(
        (m) => m.ProcessedFilesListComponent,
      ),
  },
  {
    path: 'files/:id',
    title: 'Detalhe do Arquivo',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./file-processing-dashboard/detail/detail.component').then(
        (m) => m.ProcessedFileDetailComponent,
      ),
  },
  {
    path: 'schedules',
    title: 'Status do Scheduler',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./scheduler-status/scheduler-status.component').then(
        (m) => m.SchedulerStatusComponent,
      ),
  },
  {
    path: 'upload',
    title: 'Upload de Arquivos',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FILE_PROCESSING.PROCESS],
    },
    loadComponent: () =>
      import('./file-upload/file-upload.component').then((m) => m.FileUploadComponent),
  },
  {
    path: 'browser',
    title: 'Arquivos no Volume',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.FILE_PROCESSING.READ],
    },
    loadComponent: () =>
      import('./file-browser/file-browser.component').then((m) => m.FileBrowserComponent),
  },
  {
    path: 'erp/pending-sales',
    title: 'Vendas ERP Pendentes',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./erp-pending-sales/erp-pending-sales.component').then(
        (m) => m.ErpPendingSalesComponent,
      ),
  },

  {
    path: 'rede/totalizers',
    title: 'Totalizadores Rede',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./rede-totalizers/rede-totalizers.component').then((m) => m.RedeTotalizersComponent),
  },

  {
    path: 'divergences',
    title: 'Análise de Divergências',
    canActivate: [permissionGuard],
    data: {
      requireAll: false,
      redirectTo: '/forbidden',
      permissions: [PERMISSIONS.SUPPORT, PERMISSIONS.COMPANIES.VIEW],
    },
    loadComponent: () =>
      import('./divergence-analysis/divergence-analysis.component').then(
        (m) => m.DivergenceAnalysisComponent,
      ),
  },
];
