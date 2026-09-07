import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatInr } from "@/lib/valuation-format";
import type { ValuationResult } from "@/types";

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          strong ? "font-semibold text-primary tabular-nums" : "tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Mirrors the workbook's abstract of value, so a valuer can reconcile the
 * generated figures against the sheet they are used to.
 */
export function ValuationSummary({
  result,
  isLoading,
}: {
  result?: ValuationResult;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Computed Value</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Calculating…
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Computed Value</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Fill in the plot area, adopted rate and floors, then save the draft to
          see the calculated value.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Abstract of Value</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Part A — Land" value={formatInr(result.partA)} />
          <Row label="Parts B–E — Building & extras" value={formatInr(result.partBtoE)} />
          <Separator className="my-2" />
          <Row label="Total value" value={formatInr(result.totalValue)} />
          <Row label="Market value (say)" value={formatInr(result.roundedValue)} strong />
          <Row label="Realizable value (90%)" value={formatInr(result.realizableValue)} />
          <Row label="Distress value (80%)" value={formatInr(result.distressValue)} />
          <Row label="Insurable value" value={formatInr(result.insurableValue)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Rate Composition</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Land component rate" value={`${formatInr(result.landComponentRate)} / Sq.m`} />
          <Row
            label="Depreciated building rate"
            value={`${formatInr(result.depreciatedBuildingRate)} / Sq.m`}
          />
          <Row label="Composite rate" value={`${formatInr(result.compositeRate)} / Sq.m`} />
          <Row
            label="Variation over circle rate"
            value={`${result.rateVariationPercent.toFixed(2)}%`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Govt. Guideline Value</CardTitle>
          <Badge variant={result.guideline.upliftSource === "TEHSIL_OVERRIDE" ? "default" : "outline"}>
            +{result.guideline.upliftPercent}%
            {result.guideline.upliftSource === "TEHSIL_OVERRIDE"
              ? " tehsil override"
              : " plot position"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Row
            label="Circle rate adjusted for uplift"
            value={`${formatInr(result.guideline.circleRateAdjusted)} / Sq.m`}
          />
          <Row label="Land" value={formatInr(result.guideline.landValue)} />
          <Row label="Construction" value={formatInr(result.guideline.constructionValue)} />
          <Separator className="my-2" />
          <Row label="Total (guideline)" value={formatInr(result.guideline.totalValue)} strong />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Coverage &amp; FAR</CardTitle>
        </CardHeader>
        <CardContent>
          <Row
            label="Ground coverage"
            value={`${result.coverage.achievedCoveragePercent.toFixed(2)}% of ${result.coverage.permissibleCoveragePercent}%`}
          />
          <Row
            label="FAR"
            value={`${result.coverage.achievedFAR} of ${result.coverage.permissibleFAR}`}
          />
          <Row
            label="Total covered area"
            value={`${result.coverage.totalCoveredAreaSqM.toFixed(2)} Sq.m`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
