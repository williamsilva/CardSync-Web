import { ListQueryDto, TableQueryDto } from './list-query.types';

export function buildListQuery<TAdvanced extends object>(
  table: TableQueryDto,
  advanced: Partial<TAdvanced> | undefined,
): ListQueryDto<TAdvanced> {
  return {
    ...table,
    advanced: advanced && Object.keys(advanced).length ? advanced : undefined,
  };
}
