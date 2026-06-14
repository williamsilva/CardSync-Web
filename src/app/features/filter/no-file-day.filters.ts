import { StatusEnum } from '@models/enums/status.enum';
import { FileGroupEnum } from '@models/enums/file-group.enum';
import { NoFileDayTypeEnum } from '@models/enums/no-file-day-type.enum';

export interface NoFileDayAdvancedFilters {
  description?: string;
  noFileDateFrom?: string;
  noFileDateTo?: string;
  statusEnum?: StatusEnum[] | null;
  dayType?: NoFileDayTypeEnum[] | null;
  fileGroup?: FileGroupEnum[] | null;
}
