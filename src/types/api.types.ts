export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FindQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  dateCondition?: string;
  startDate?: string;
  endDate?: string;
}
