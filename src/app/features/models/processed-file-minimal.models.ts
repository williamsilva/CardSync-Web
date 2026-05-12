export interface ProcessedFileMinimalModel {
  id: string;
  file: string;
}

export function mapProcessedFileMinimalModel(
  input: ProcessedFileMinimalModel,
): ProcessedFileMinimalModel {
  return {
    ...input,
  };
}

export function mapProcessedFileMinimalModels(
  items: ProcessedFileMinimalModel[] | null | undefined,
): ProcessedFileMinimalModel[] {
  return (items ?? []).map(mapProcessedFileMinimalModel);
}
