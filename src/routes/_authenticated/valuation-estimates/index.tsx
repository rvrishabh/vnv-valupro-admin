import { createFileRoute } from "@tanstack/react-router";
import { ValuationEstimatesTable } from "./-components/ValuationEstimatesTable";

export const Route = createFileRoute("/_authenticated/valuation-estimates/")({
  component: ValuationEstimatesPage,
});

function ValuationEstimatesPage() {
  return <ValuationEstimatesTable />;
}
