export type ValuationMethod = "LAND_AND_BUILDING" | "CRM" | "PLOT";
export type ValuationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type RoofType = "RCC" | "RBC" | "Girder Stone" | "Tin Shed" | "Kachcha";

export interface FloorInput {
  name: string;
  coveredAreaSqM: number;
  replacementRate: number;
  roofType: RoofType;
  constructionCategory?: 1 | 2;
  specs?: Record<string, string>;
}

export interface LandInput {
  prevailingMarketRate: number;
  circleRate: number;
  adoptedRate: number;
  plotPosition: string;
  superAreaPercent?: number;
}

export interface BuildingInput {
  yearOfConstruction: number;
  expectedLifeYears?: number;
  floors: FloorInput[];
}

/** Per-floor depreciation, as computed by the backend engine. */
export interface FloorValuation {
  name: string;
  coveredAreaSqM: number;
  age: number;
  residualAge: number;
  depreciationPercent: number;
  replacementRate: number;
  replacementValue: number;
  depreciation: number;
  depreciatedValue: number;
}

export interface GuidelineValuation {
  circleRateAdjusted: number;
  landValue: number;
  constructionValue: number;
  totalValue: number;
  floors: {
    name: string;
    roofType: RoofType;
    constructionRate: number;
    depreciatedRate: number;
    value: number;
  }[];
}

export interface CoverageResult {
  plotAreaSqM: number;
  groundCoverageSqM: number;
  permissibleCoveragePercent: number;
  permissibleFAR: number;
  achievedCoveragePercent: number;
  totalCoveredAreaSqM: number;
  achievedFAR: number;
}

export interface ValuationResult {
  method: ValuationMethod;
  landValue: number;
  partA: number;
  floors: FloorValuation[];
  partBtoE: number;
  extraItemsValue: number;
  totalValue: number;
  roundedValue: number;
  realizableValue: number;
  distressValue: number;
  insurableValue: number;
  depreciatedBuildingRate: number;
  landComponentRate: number;
  compositeRate: number;
  fairMarketValue: number;
  rateVariationPercent: number;
  guideline: GuidelineValuation;
  coverage: CoverageResult;
}

export interface Valuation {
  id: string;
  caseId: string;
  engineerId: string;
  status: ValuationStatus;
  method: ValuationMethod;
  reportYear: number | null;
  tehsil: string | null;
  /** M-Doc!C8 — House / Flat / Shop / ... */
  propertyType: string | null;
  advanceReceived: string | number | null;
  assetsSoldAsPerDeed: string | null;
  /** Freehold | Leasehold */
  tenure: string | null;
  leaseDetails: Record<string, unknown> | null;
  siteAddress: Record<string, unknown> | null;
  discrepancy: Record<string, unknown> | null;
  plotAreaSqM: string | number | null;
  yearOfConstruction: number | null;
  expectedLifeYears: number | null;
  prevailingMarketRate: string | number | null;
  circleRate: string | number | null;
  adoptedRate: string | number | null;
  plotPosition: string | null;
  superAreaPercent: string | number | null;
  titleDeed: Record<string, unknown> | null;
  boundaries: Record<string, unknown> | null;
  dimensions: Record<string, unknown> | null;
  buildingSpecs: Record<string, unknown> | null;
  floors: FloorInput[] | null;
  generalDetails: Record<string, unknown> | null;
  extraItems: Record<string, number | string> | null;
  services: Record<string, number | string> | null;
  siteVisit: Record<string, unknown> | null;
  totalMarketValue: string | number | null;
  roundedMarketValue: string | number | null;
  realizableValue: string | number | null;
  distressValue: string | number | null;
  guidelineTotalValue: string | number | null;
  computed: ValuationResult | null;
  computedAt: string | null;
  checkerNotes: string | null;
  checkerStatus: string | null;
  engineerNotes: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  engineer?: { id: string; name: string; email: string };
  case?: {
    id: string;
    caseNumber: string;
    customerName: string;
    institution?: { id: string; name: string; code: string };
    branch?: { id: string; branchName: string };
  };
}

export interface ListValuationsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  caseId?: string;
  status?: string;
}

/** group -> allowed values, sourced from the workbook's dropdown lists. */
export type ValuationOptions = Record<string, string[]>;
