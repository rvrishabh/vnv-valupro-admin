export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string | null;
  createdAt: string;
}

export interface ListPermissionsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  resource?: string;
  action?: string;
}
