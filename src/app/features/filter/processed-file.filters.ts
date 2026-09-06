import { WritableSignal } from '@angular/core';

export interface ProcessedFileFiltersState {
  id: string;
}

export type ProcessedFileAdvancedFilters = Partial<ProcessedFileFiltersState>;

export type ProcessedFileAdvancedFilterSignals = {
  [K in keyof ProcessedFileFiltersState]: WritableSignal<ProcessedFileFiltersState[K]>;
};

export function createEmptyProcessedFileFiltersState(): ProcessedFileFiltersState {
  return {
    id: '',
  };
}

export function resetProcessedFileAdvancedFilters(
  filters: ProcessedFileAdvancedFilterSignals,
): void {
  const empty = createEmptyProcessedFileFiltersState();

  filters.id.set(empty.id);
}
