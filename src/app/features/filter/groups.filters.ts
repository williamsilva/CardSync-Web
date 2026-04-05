export interface GroupsAdvancedFilters {
  name?: string;
  description?: string;

  createdAtTo?: string;
  createdAtFrom?: string;

  createdBy?: string[] | null;
}
