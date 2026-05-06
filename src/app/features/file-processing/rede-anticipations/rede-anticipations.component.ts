import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';

import { FileProcessingService } from '@features/service/file-processing.service';
import { RedeAnticipationModel } from '@models/file-processing.models';
import { formatCurrency } from '../file-processing-ui';

@Component({
  selector: 'cs-rede-anticipations',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule, TableModule],
  templateUrl: './rede-anticipations.component.html',
  styleUrl: './rede-anticipations.component.scss',
})
export class RedeAnticipationsComponent {
  private readonly service = inject(FileProcessingService);

  protected readonly rows = signal<RedeAnticipationModel[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pageSize = signal(15);

  protected load(event: TableLazyLoadEvent = { first: 0, rows: this.pageSize() }): void {
    const rows = event.rows ?? this.pageSize();
    const page = Math.floor((event.first ?? 0) / rows);
    const sortField = typeof event.sortField === 'string' ? event.sortField : 'releaseDate';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.loading.set(true);
    this.service
      .listRedeAnticipations({ page, size: rows, sort: `${sortField},${sortOrder}` })
      .subscribe({
        next: (response) => {
          this.rows.set(response.content ?? []);
          this.totalRecords.set(response.totalElements ?? 0);
        },
        error: () => this.loading.set(false),
        complete: () => this.loading.set(false),
      });
  }

  protected readonly formatCurrency = formatCurrency;
}
