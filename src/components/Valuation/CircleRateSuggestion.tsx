import { useCircleRateSuggestionQuery } from "@/api/queries/valuations";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/valuation-format";
import type { ValuationMethod } from "@/types";

interface CircleRateSuggestionProps {
  tehsil: string;
  mohalla: string;
  roadWidthMeters: number;
  method: ValuationMethod;
  onUse: (rate: number) => void;
  disabled?: boolean;
}

/**
 * Surfaces the last circle rate a valuer recorded for this exact area,
 * category and road-width band — a starting point to accept or overwrite, not
 * an authority. There is no bulk-imported register behind this: the printed
 * circle-rate lists arrive as scanned, unstructured tables, and OCR on a
 * photocopied Devanagari table is not something to trust for a figure that
 * drives a valuation. This grows from real reports instead.
 */
export function CircleRateSuggestion({
  tehsil,
  mohalla,
  roadWidthMeters,
  method,
  onUse,
  disabled,
}: CircleRateSuggestionProps) {
  const query = useCircleRateSuggestionQuery({ tehsil, mohalla, roadWidthMeters, method });

  if (!tehsil || !mohalla || !roadWidthMeters) {
    return (
      <p className="text-xs text-muted-foreground">
        Fill in the tehsil, mohalla and road width to see a suggested rate.
      </p>
    );
  }

  if (query.isLoading) {
    return <p className="text-xs text-muted-foreground">Checking past rates for this area…</p>;
  }

  if (!query.data) {
    return (
      <p className="text-xs text-muted-foreground">
        No rate recorded yet for {mohalla} at this road width — this will be the first.
      </p>
    );
  }

  const { rate, effectiveFrom, caseNumber } = query.data;

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-dashed p-2">
      <p className="text-xs text-muted-foreground">
        Last used <span className="font-medium text-foreground">{formatInr(rate)}/Sq.m</span> on{" "}
        {new Date(effectiveFrom).toLocaleDateString("en-IN")}
        {caseNumber ? ` in ${caseNumber}` : ""}.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onUse(rate)}
      >
        Use this rate
      </Button>
    </div>
  );
}
