import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { CsTagComponent } from '@shared/ui';
import { ProcessedFileModel } from '@models/file-processing.models';
import { FileProcessingService } from '@features/service/file-processing.service';
import { fileStatusSeverity as getFileStatusSeverity } from '../file-processing-ui';

@Component({
  standalone: true,
  selector: 'cs-processed-files-list',
  styleUrl: './processed-files-list.component.scss',
  templateUrl: './processed-files-list.component.html',
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    CsTagComponent,
  ],
})
export class ProcessedFilesListComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly rows = signal<ProcessedFileModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);

  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'dateImport';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.loading.set(true);
    this.service.listFiles({ page, size: rows, sort: `${sortField},${sortOrder}` }).subscribe({
      next: (response) => {
        this.rows.set(response.content ?? []);
        this.totalRecords.set(response.totalElements ?? 0);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  protected readonly fileStatusSeverity = getFileStatusSeverity;
}
