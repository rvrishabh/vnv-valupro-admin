import { useCaseQuery, useCaseTimelineQuery } from "@/api/queries/cases";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DetailPageSkeleton } from "@/components/DetailPageSkeleton";
import { caseDetailSearchSchema } from "@/schemas";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CaseDetailHeader } from "./-components/CaseDetailHeader";
import { CaseOverviewTab } from "./-components/CaseOverviewTab";
import { CaseValuationTab } from "./-components/CaseValuationTab";

export const Route = createFileRoute("/_authenticated/cases/$id")({
  validateSearch: caseDetailSearchSchema,
  component: CaseDetailPage,
});

function CaseDetailPage() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const caseQuery = useCaseQuery(id);
  const timelineQuery = useCaseTimelineQuery(id);

  const record = caseQuery.data;

  if (caseQuery.isLoading || !record) {
    return (
      <DetailPageSkeleton
        gridColsClassName="lg:grid-cols-[minmax(0,1fr)_340px]"
        tabCount={2}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <CaseDetailHeader record={record} />

      <Tabs
        value={tab ?? "overview"}
        onValueChange={(value) =>
          navigate({ search: { tab: value as "overview" | "valuation" } })
        }
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="valuation">
            Valuation
            {record.report ? (
              <Badge
                variant={record.report.status === "APPROVED" ? "default" : "secondary"}
                className="ml-1.5"
              >
                {record.report.status}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <CaseOverviewTab record={record} timeline={timelineQuery.data} />
        </TabsContent>

        <TabsContent value="valuation" className="mt-4">
          <CaseValuationTab record={record} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
