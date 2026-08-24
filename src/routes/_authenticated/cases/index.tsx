import { createFileRoute } from "@tanstack/react-router";
import { CasesTable } from "./-components/CasesTable";

export const Route = createFileRoute("/_authenticated/cases/")({
  component: CasesPage,
});

function CasesPage() {
  return <CasesTable />;
}
