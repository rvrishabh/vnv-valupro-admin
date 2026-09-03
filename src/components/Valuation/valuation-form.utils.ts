import { emptyFloor } from "@/components/Valuation/FloorsEditor";
import { GENERAL_FIELDS, type FieldDef } from "@/components/Valuation/field-groups";
import { toNumber } from "@/lib/valuation-format";
import type {
  Direction,
  DirectionalMeasurement,
  DirectionalSection,
  Valuation,
  ValuationFormValues,
} from "@/types";

export type FormState = ValuationFormValues;

export const METHODS = [
  { value: "LAND_AND_BUILDING", label: "Land & Building" },
  { value: "CRM", label: "Composite Rate (CRM)" },
  { value: "PLOT", label: "Vacant Plot" },
];

export const AREA_UNITS = [
  { value: "Sq.m", label: "Sq.m" },
  { value: "Ha", label: "Hectares" },
];

export const DIMENSION_UNITS = [
  { value: "ft", label: "Feet" },
  { value: "m", label: "Metres" },
];

export const DIRECTIONS: Direction[] = ["north", "south", "east", "west"];

/** M-Doc title-deed fields that are plain text in the sheet. */
export const TITLE_DEED_TEXT_FIELDS = [
  { key: "deedNo", label: "Title deed no." },
  { key: "bahiNo", label: "Bahi no." },
  { key: "jildNo", label: "Jild no." },
  { key: "purchaseDate", label: "Date of purchase as per deed" },
  { key: "purchasePrice", label: "Purchase price as per deed" },
  { key: "sellers", label: "Name of sellers as per deed" },
] as const;

export const BOUNDARY_GRID = "grid-cols-[80px_1fr_1fr_110px_110px]";

/**
 * Fills in each field's `defaultValue` for any key the draft hasn't set yet
 * — most are "N.A." (a safe unset state for a select field, or a cell a
 * filled-out example of the master workbook consistently leaves at N.A.),
 * a few are a real answer the book's example uses so consistently it's
 * effectively the standard one (e.g. "Available" for road facilities).
 */
function applyFieldDefaults(
  source: Record<string, unknown> | null | undefined,
  fields: FieldDef[],
): Record<string, unknown> {
  const section = { ...(source ?? {}) };
  for (const field of fields) {
    if (field.defaultValue !== undefined && (section[field.key] ?? "") === "") {
      section[field.key] = field.defaultValue;
    }
  }
  return section;
}

function toDateSection(
  source: Record<string, unknown> | null | undefined,
  key: string,
): Record<string, unknown> {
  const section = { ...(source ?? {}) };
  const raw = section[key];
  if (typeof raw === "string" && raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      section[key] = parsed;
    }
  }
  return section;
}

/** Widens the API's loose per-direction blob into the form's fixed shape. */
function toDirectionalSection(
  source: Record<string, unknown> | null,
): DirectionalSection {
  const rows = (source ?? {}) as Record<
    string,
    DirectionalMeasurement | undefined
  >;
  return DIRECTIONS.reduce((section, direction) => {
    const row = rows[direction] ?? {};
    section[direction] = {
      asPerDocs: String(row.asPerDocs ?? ""),
      asPerSite: String(row.asPerSite ?? ""),
    };
    return section;
  }, {} as DirectionalSection);
}

export function toFormState(v: Valuation): FormState {
  return {
    method: v.method,
    propertyType: v.propertyType ?? "",
    reportYear: String(v.reportYear ?? new Date().getFullYear()),
    dimensionUnit: (v.dimensionUnit as FormState["dimensionUnit"]) ?? "ft",
    areaUnit: (v.areaUnit as FormState["areaUnit"]) ?? "Sq.m",
    areaBasis: v.areaBasis ?? "",
    undividedShareOfLand: String(toNumber(v.undividedShareOfLand) ?? ""),
    documentsReceived: v.documentsReceived ?? "",
    gpsCoordinates: v.gpsCoordinates ?? "",
    briefDescription: v.briefDescription ?? "",
    areaAsPerDeed: String(toNumber(v.areaAsPerDeed) ?? ""),
    areaAsPerSite: String(toNumber(v.areaAsPerSite) ?? ""),
    advanceReceived: String(toNumber(v.advanceReceived) ?? ""),
    assetsSoldAsPerDeed: v.assetsSoldAsPerDeed ?? "",
    // Most valuations are Freehold; a draft that hasn't touched this yet
    // should start there rather than blank.
    tenure: v.tenure ?? "Freehold",
    prevailingMarketRate: String(toNumber(v.prevailingMarketRate) ?? ""),
    circleRate: String(toNumber(v.circleRate) ?? ""),
    adoptedRate: String(toNumber(v.adoptedRate) ?? ""),
    plotPosition: v.plotPosition ?? "",
    // Stored as a fraction; shown as a percentage.
    superAreaPercent: String((toNumber(v.superAreaPercent) ?? 0) * 100),
    yearOfConstruction: String(v.yearOfConstruction ?? ""),
    expectedLifeYears: String(v.expectedLifeYears ?? 80),
    floors: (v.floors?.length ? v.floors : [emptyFloor(0)]).map((floor) => ({
      ...floor,
      yearOfConstruction:
        floor.yearOfConstruction ?? v.yearOfConstruction ?? undefined,
      expectedLifeYears:
        floor.expectedLifeYears ?? v.expectedLifeYears ?? undefined,
    })),
    titleDeed: toDateSection(v.titleDeed, "purchaseDate"),
    leaseDetails: toDateSection(v.leaseDetails, "dateOfCommencement"),
    siteAddress: v.siteAddress ?? {},
    discrepancy: v.discrepancy ?? {},
    boundaries: toDirectionalSection(v.boundaries),
    dimensions: toDirectionalSection(v.dimensions),
    buildingSpecs: v.buildingSpecs ?? {},
    generalDetails: applyFieldDefaults(v.generalDetails, GENERAL_FIELDS),
    rooms: v.rooms ?? {},
    floorDetails: v.floorDetails ?? {},
    engineerNotes: v.engineerNotes ?? "",
  };
}
