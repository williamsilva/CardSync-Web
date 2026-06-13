import { WritableSignal } from '@angular/core';

import { PeriodEnum } from '@models/enums/period.enum';
import { FileProcessingStatus } from '@models/file-processing.models';

export type ProcessedFilesFiltersState = {
  fileName: string;
  group: string[] | null;
  status: FileProcessingStatus[] | null;
  dateFile: string | string[] | null;
  periodDateFile: PeriodEnum | null;
  dateImport: string | string[] | null;
  periodDateImport: PeriodEnum | null;
};

export type ProcessedFilesAdvancedFilters = Partial<ProcessedFilesFiltersState>;

export type ProcessedFilesAdvancedFilterSignals = {
  [K in keyof ProcessedFilesFiltersState]: WritableSignal<ProcessedFilesFiltersState[K]>;
};

export function createEmptyProcessedFilesFiltersState(): ProcessedFilesFiltersState {
  return {
    fileName: '',
    group: null,
    status: null,
    dateFile: null,
    periodDateFile: null,
    dateImport: null,
    periodDateImport: null,
  };
}

export function resetProcessedFilesAdvancedFilters(
  filters: ProcessedFilesAdvancedFilterSignals,
): void {
  const empty = createEmptyProcessedFilesFiltersState();
  filters.fileName.set(empty.fileName);
  filters.group.set(empty.group);
  filters.status.set(empty.status);
  filters.dateFile.set(empty.dateFile);
  filters.periodDateFile.set(empty.periodDateFile);
  filters.dateImport.set(empty.dateImport);
  filters.periodDateImport.set(empty.periodDateImport);
}
