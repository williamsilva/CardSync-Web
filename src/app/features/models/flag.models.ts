import { StatusEnum } from '@models/enums/status.enum';

export interface FlagModel {
  id: number;
  name: string;

  statusEnum?: StatusEnum[] | null;
}
