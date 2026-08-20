export type CaseStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "CHECKING"
  | "QUERY_RAISED"
  | "APPROVED"
  | "REJECTED";

export type PropertyType = "RESIDENTIAL" | "COMMERCIAL" | "LAND" | "INDUSTRIAL";

export interface Case {
  id: string;
  caseNumber: string;
  status: CaseStatus;
  institutionId: string;
  branchId: string | null;
  customerName: string;
  customerMobile: string;
  propertyType: PropertyType;
  propertyLocation: string | null;
  bankReference: string | null;
  createdAt: string;
  institution?: { id: string; name: string; code: string };
  branch?: { id: string; branchName: string };
  report?: { id: string } | null;
}

export interface ListCasesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  institutionId?: string;
}
