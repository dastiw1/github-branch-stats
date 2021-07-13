import { Branch } from '@/types/repos';

export type DataType = 'passive' | 'active';

export type StatsFilterParams = {
  url: string;
  branch: string | null;
  dateRange: string[];
  dataTypes: DataType[];
};

export type DataTypeItem = {
  text: string;
  value: DataType;
};
