import FormInput from "@/components/Form/FormInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DirectionalSection,
  ValuationFormValues,
} from "@/types";
import { type Control, useFormContext, useWatch } from "react-hook-form";
import { Field, FIELD_LABEL_CLASS } from "./SectionFields";

/** Sq.ft -> Sq.m divisor used throughout the workbook (M-Doc!C100). */
const SQFT_PER_SQM = 10.765;

export type DimensionUnit = "ft" | "m";

export interface SideValues {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

/** Pulls one column (docs or site) out of the per-direction dimensions blob. */
function sidesFor(
  dimensions: DirectionalSection | undefined,
  column: "asPerDocs" | "asPerSite",
): SideValues {
  return {
    north: String(dimensions?.north?.[column] ?? ""),
    south: String(dimensions?.south?.[column] ?? ""),
    east: String(dimensions?.east?.[column] ?? ""),
    west: String(dimensions?.west?.[column] ?? ""),
  };
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
  control,
  disabled,
}: {
  control: Control<ValuationFormValues>;
  disabled?: boolean;
}) {
  const { setValue } = useFormContext<ValuationFormValues>();

  const dimensionUnit = useWatch({ control, name: "dimensionUnit" });
  const dimensions = useWatch({ control, name: "dimensions" });
  const asPerDeed = useWatch({ control, name: "areaAsPerDeed" });
  const asPerSite = useWatch({ control, name: "areaAsPerSite" });

  const unit: DimensionUnit = dimensionUnit ?? "ft";
  const areaFromDocs = areaFromSides(sidesFor(dimensions, "asPerDocs"), unit);
  const areaFromSite = areaFromSides(sidesFor(dimensions, "asPerSite"), unit);

  const consideration = resolveConsideration(
    numberOrNull(asPerDeed ?? ""),
    numberOrNull(asPerSite ?? ""),
  );

  // Typing a deed area carries it across to the site until the site is edited
  // on its own, which is how the sheet seeds C104 from C103.
  // `asPerDeed`/`asPerSite` are this render's values, i.e. the ones from
  // before the keystroke — which is exactly what decides whether the site
  // column was still following the deed.
  const mirrorToSite = (_next: unknown, raw: string) => {
    if (asPerSite === "" || asPerSite === asPerDeed) {
      setValue("areaAsPerSite", raw, { shouldDirty: true });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Area of Site</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Area as per dimensions (documents)">
            <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm tabular-nums">
              {areaFromDocs === null ? "—" : `${areaFromDocs} Sq.m`}
            </div>
          </Field>

          <Field label="Area as per dimensions (site)">
            <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm tabular-nums">
              {areaFromSite === null ? "—" : `${areaFromSite} Sq.m`}
            </div>
          </Field>

          <FormInput
            control={control}
            name="areaAsPerDeed"
            label="Area of property as per deed (Sq.m)"
            labelClassName={FIELD_LABEL_CLASS}
            type="number"
            step="0.01"
            min="0"
            disabled={disabled}
            onValueChange={mirrorToSite}
          />

          <FormInput
            control={control}
            name="areaAsPerSite"
            label="Area of property as per site (Sq.m)"
            labelClassName={FIELD_LABEL_CLASS}
            type="number"
            step="0.01"
            min="0"
            disabled={disabled}
            hint="Mirrors the deed until you enter a different measurement."
          />
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
