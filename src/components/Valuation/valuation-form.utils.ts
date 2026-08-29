import { emptyFloor } from "@/components/Valuation/FloorsEditor";
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
    tenure: v.tenure ?? "",
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
    titleDeed: v.titleDeed ?? {},
    leaseDetails: v.leaseDetails ?? {},
    siteAddress: v.siteAddress ?? {},
    discrepancy: v.discrepancy ?? {},
    boundaries: toDirectionalSection(v.boundaries),
    dimensions: toDirectionalSection(v.dimensions),
    buildingSpecs: v.buildingSpecs ?? {},
    generalDetails: v.generalDetails ?? {},
    rooms: v.rooms ?? {},
    floorDetails: v.floorDetails ?? {},
    engineerNotes: v.engineerNotes ?? "",
  };
}
