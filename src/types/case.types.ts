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
  assignedAt: string | null;
  surveyStartedAt: string | null;
  surveyCompletedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  createdBy?: CaseParticipant;
  assignedTo?: CaseParticipant;
  checkedBy?: CaseParticipant;
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

export interface CaseParticipant {
  id: string;
  name: string;
  email: string;
}

export interface CaseAuditEvent {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  notes: string | null;
  createdAt: string;
  actor: CaseParticipant;
}

/** GET /cases/:id/timeline */
export interface CaseTimeline {
  participants: {
    createdBy: CaseParticipant | null;
    assignedTo: CaseParticipant | null;
    checkedBy: CaseParticipant | null;
  };
  milestones: {
    createdAt: string | null;
    assignedAt: string | null;
    surveyStartedAt: string | null;
    surveyCompletedAt: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
  };
  events: CaseAuditEvent[];
}
