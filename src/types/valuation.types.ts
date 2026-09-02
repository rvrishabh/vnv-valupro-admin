export type ValuationMethod = "LAND_AND_BUILDING" | "CRM" | "PLOT";
export type ValuationStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type RoofType = "RCC" | "RBC" | "Girder Stone" | "Tin Shed" | "Kachcha";

export interface FloorInput {
  name: string;
  /**
   * M-Rate!E49 — the area actually valued. Mirrors the measured area until a
   * different basis (approved plan, bye laws) is recorded against the floor.
   */
  coveredAreaSqM?: number;
  /** M-Rate!D49 — the area measured on site. */
  actualAreaSqM?: number;
  replacementRate?: number;
  roofType: RoofType;
  constructionCategory?: 1 | 2;
  /** Falls back to the building-level year when not set. */
  yearOfConstruction?: number;
  expectedLifeYears?: number;
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
  areaUnit: string | null;
  areaBasis: string | null;
  undividedShareOfLand: string | number | null;
  documentsReceived: string | null;
  gpsCoordinates: string | null;
  /** Local body / mohalla the circle-rate register is keyed on. */
  circleRateMohalla: string | null;
  /** Metres — picks the <=9m / 9-18m / >18m circle-rate band. */
  roadWidthMeters: string | number | null;
  briefDescription: string | null;
  rooms: Record<string, unknown> | null;
  floorDetails: Record<string, unknown> | null;
  advanceReceived: string | number | null;
  assetsSoldAsPerDeed: string | null;
  /** Freehold | Leasehold */
  tenure: string | null;
  leaseDetails: Record<string, unknown> | null;
  siteAddress: Record<string, unknown> | null;
  discrepancy: Record<string, unknown> | null;
  plotAreaSqM: string | number | null;
  areaAsPerDeed: string | number | null;
  areaAsPerSite: string | number | null;
  dimensionUnit: string | null;
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

export type PhotoSection = "SITE_VISIT" | "GOOGLE_EARTH";

/** GET /valuations/:id/photos — metadata plus the R2 public URL (no image bytes go through this API). */
export interface ValuationPhotoMeta {
  id: string;
  section: PhotoSection;
  sortOrder: number;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  url: string;
}

/** GET /valuations/circle-rate-suggestion — null when nobody has entered one yet. */
export interface CircleRateSuggestion {
  rate: number;
  effectiveFrom: string;
  caseNumber: string | null;
}

/** A patchable, loosely-typed section of the form (title deed, lease, etc). */
export type ValuationFormSection = Record<string, unknown>;

export type Direction = "north" | "south" | "east" | "west";

/** One side of the plot, as recorded on the deed and as measured on site. */
export interface DirectionalMeasurement {
  asPerDocs?: string;
  asPerSite?: string;
}

/** Boundaries and dimensions are both captured per direction. */
export type DirectionalSection = Record<Direction, DirectionalMeasurement>;

/**
 * The ValuationEditor's react-hook-form values. Numeric fields stay strings
 * while editing, matching the workbook's own text-entry cells — they're
 * coerced to numbers only when building the API payload.
 */
export interface ValuationFormValues {
  method: ValuationMethod;
  propertyType: string;
  reportYear: string;
  dimensionUnit: "ft" | "m";
  /** Unit areas are displayed and entered in (M-Doc!C92). */
  areaUnit: "Sq.m" | "Ha";
  /** What the area under consideration measures (M-Doc!C108). */
  areaBasis: string;
  /** M-Doc!C110 — only used for a Flat; a Shop derives it, others have none. */
  undividedShareOfLand: string;
  documentsReceived: string;
  gpsCoordinates: string;
  briefDescription: string;
  areaAsPerDeed: string;
  areaAsPerSite: string;
  advanceReceived: string;
  assetsSoldAsPerDeed: string;
  tenure: string;
  prevailingMarketRate: string;
  circleRate: string;
  adoptedRate: string;
  plotPosition: string;
  superAreaPercent: string;
  yearOfConstruction: string;
  expectedLifeYears: string;
  floors: FloorInput[];
  titleDeed: ValuationFormSection;
  leaseDetails: ValuationFormSection;
  siteAddress: ValuationFormSection;
  discrepancy: ValuationFormSection;
  boundaries: DirectionalSection;
  dimensions: DirectionalSection;
  buildingSpecs: ValuationFormSection;
  generalDetails: ValuationFormSection;
  rooms: ValuationFormSection;
  floorDetails: ValuationFormSection;
  engineerNotes: string;
}
