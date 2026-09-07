import { useCircleRateUpliftResolveQuery } from "@/api/queries/circle-rate-uplift";
import { formatInr, toNumber } from "@/lib/valuation-format";
import type { FormState } from "@/components/Valuation/valuation-form.utils";
import { IconTrendingUp } from "@tabler/icons-react";
import { useWatch, type Control } from "react-hook-form";

/**
 * The default table ValuationCalculator.circleRateUplift falls back to
 * whenever a tehsil + plot position has no Settings override — kept in sync
 * with that function by hand, since it is a fixed, rarely-changed table.
 */
const DEFAULT_UPLIFT_PERCENT: Record<string, number> = {
  "2 Side Road Facing Plot": 10,
  "Park Facing": 10,
  "Park & 2 Side Road Facing Plot": 20,
};

/**
 * Live readout of the guideline circle rate's positional uplift as the
 * valuer picks a plot position — the same figure the engine applies on
 * recalculate, shown immediately rather than only after saving.
 */
export function CircleRateUpliftNote({
  control,
  tehsilValue,
}: {
  control: Control<FormState>;
  tehsilValue: string;
}) {
  const plotPosition = useWatch({ control, name: "plotPosition" });
  const circleRateRaw = useWatch({ control, name: "circleRate" });
  const circleRate = toNumber(circleRateRaw);

  const resolveQuery = useCircleRateUpliftResolveQuery(tehsilValue);

  if (!plotPosition) return null;

  const overridePercent = resolveQuery.data?.overrides[plotPosition];
  const percent = overridePercent ?? DEFAULT_UPLIFT_PERCENT[plotPosition] ?? 0;
  const isOverride = overridePercent !== undefined;

  if (percent === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No uplift applies to "{plotPosition}" — the circle rate is used as
        entered.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <IconTrendingUp className="size-3.5 text-primary" />
      Circle rate increased by{" "}
      <span className="font-medium text-foreground">+{percent}%</span> for
      "{plotPosition}"
      {isOverride ? ` (${tehsilValue} tehsil override)` : " (default)"}
      {circleRate ? (
        <>
          {" "}
          → <span className="font-medium text-foreground">
            {formatInr(circleRate * (1 + percent / 100))}/Sq.m
          </span>
        </>
      ) : null}
    </p>
  );
}
