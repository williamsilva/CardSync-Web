import { Injectable, inject, signal } from '@angular/core';

import { finalize } from 'rxjs';

import { ImportedFileCalendarModel } from '@models/file-processing.models';
import { FileProcessingService } from '@features/service/file-processing.service';

@Injectable({ providedIn: 'root' })
export class ImportedFilesCalendarFacade {
  private readonly api = inject(FileProcessingService);

  private readonly _loading = signal(false);
  private readonly _calendar = signal<ImportedFileCalendarModel | null>(null);
  private _loadedMonth: string | null = null;

  readonly loading = this._loading.asReadonly();
  readonly calendar = this._calendar.asReadonly();

  loadCalendar(month: string, force = false): void {
    if (this._loading()) return;
    if (!force && this._loadedMonth === month && this._calendar() !== null) return;

    this._loading.set(true);

    this.api
      .getImportedFilesCalendar(month)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (calendar) => {
          this._calendar.set(calendar);
          this._loadedMonth = month;
        },
        error: () => this._calendar.set(null),
      });
  }

  reload(month: string): void {
    this.loadCalendar(month, true);
  }
}
