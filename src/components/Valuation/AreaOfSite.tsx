import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Sq.ft -> Sq.m divisor used throughout the workbook (M-Doc!C100). */
const SQFT_PER_SQM = 10.765;

export type DimensionUnit = "ft" | "m";

export interface SideValues {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

/** Excel ROUND: half away from zero, unlike JS Math.round on negatives. */
function excelRound(value: number, digits = 0): number {
  const factor = Math.pow(10, digits);
  const scaled = value * factor;
  const nudged = scaled + Math.sign(scaled) * Math.abs(scaled) * Number.EPSILON * 4;
  return (Math.sign(nudged) * Math.round(Math.abs(nudged))) / factor;
}

/**
 * Area implied by the four sides (M-Doc!B100 / C100) — opposite sides are
 * averaged so an irregular plot still yields a usable rectangle. Returns null
 * until all four are known, since a missing side would halve an average and
 * produce a plausible but wrong area.
 */
export function areaFromSides(
  sides: SideValues | undefined,
  unit: DimensionUnit,
): number | null {
  const values = [sides?.north, sides?.south, sides?.east, sides?.west].map(
    (v) => Number(v) || 0,
  );
  if (values.some((v) => v <= 0)) return null;

  const [north, south, east, west] = values;
  const width = (north + south) / 2;
  const depth = (east + west) / 2;
  const area = unit === "ft" ? (depth * width) / SQFT_PER_SQM : width * depth;

  return excelRound(area, 2);
}

export interface AreaOfSiteValue {
  asPerDeed: string;
  asPerSite: string;
}

/**
 * The three areas the valuation turns on. The site area mirrors the deed until
 * it is edited; when the two disagree the smaller governs, because valuing land
 * the owner cannot produce would overstate the security.
 */
export function resolveConsideration(deed: number | null, site: number | null) {
  if (deed === null && site === null) {
    return { value: null as number | null, source: "none" as const, hasVariation: false };
  }
  if (deed === null || site === null) {
    return {
      value: (deed ?? site) as number,
      source: deed === null ? ("site" as const) : ("deed" as const),
      hasVariation: false,
    };
  }

  const hasVariation = deed !== site;
  return {
    value: Math.min(deed, site),
    source: !hasVariation || deed <= site ? ("deed" as const) : ("site" as const),
    hasVariation,
  };
}

const numberOrNull = (value: string): number | null => {
  const parsed = Number(value);
  return value !== "" && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function AreaOfSite({
  value,
  onChange,
  dimensionUnit,
  docsSides,
  siteSides,
  disabled,
}: {
  value: AreaOfSiteValue;
  onChange: (next: AreaOfSiteValue) => void;
  dimensionUnit: DimensionUnit;
  docsSides?: SideValues;
  siteSides?: SideValues;
  disabled?: boolean;
}) {
  const areaFromDocs = areaFromSides(docsSides, dimensionUnit);
  const areaFromSite = areaFromSides(siteSides, dimensionUnit);

  const deed = numberOrNull(value.asPerDeed);
  const site = numberOrNull(value.asPerSite);
  const consideration = resolveConsideration(deed, site);

  // Typing a deed area carries it across to the site until the site is edited
  // on its own, which is how the sheet seeds C104 from C103.
  const setDeed = (next: string) => {
    const mirrored = value.asPerSite === value.asPerDeed || value.asPerSite === "";
    onChange({
      asPerDeed: next,
      asPerSite: mirrored ? next : value.asPerSite,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Area of Site</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Area as per dimensions (documents)
            </Label>
            <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm tabular-nums">
              {areaFromDocs === null ? "—" : `${areaFromDocs} Sq.m`}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Area as per dimensions (site)
            </Label>
            <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm tabular-nums">
              {areaFromSite === null ? "—" : `${areaFromSite} Sq.m`}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Area of property as per deed (Sq.m)
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={value.asPerDeed}
              disabled={disabled}
              onChange={(e) => setDeed(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Area of property as per site (Sq.m)
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={value.asPerSite}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, asPerSite: e.target.value })}
            />
            <span className="text-xs text-muted-foreground">
              Mirrors the deed until you enter a different measurement.
            </span>
          </div>
        </div>

        <div className="rounded-md border bg-muted/40 p-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium">
              Area under consideration for valuation
            </span>
            <span className="text-base font-semibold tabular-nums text-primary">
              {consideration.value === null ? "—" : `${consideration.value} Sq.m`}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {consideration.value === null
              ? "Enter the deed area to set the area valued."
              : consideration.hasVariation
                ? `Deed and site differ — the lesser (as per ${consideration.source}) is valued.`
                : "Deed and site agree — valued as per the deed."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
