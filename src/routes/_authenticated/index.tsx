import {
  useBranchesQuery,
  useBranchVerificationQueueQuery,
} from "@/api/queries/branches";
import { useInstitutionTypesQuery } from "@/api/queries/institution-types";
import { useInstitutionsQuery } from "@/api/queries/institutions";
import { useUsersQuery } from "@/api/queries/users";
import { useValuationEstimatesQuery } from "@/api/queries/valuation-estimates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseAuth } from "@/hooks/useAuth";
import {
  IconBuildingBank,
  IconBuildingSkyscraper,
  IconCalculator,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  isLoading: boolean;
  to: string;
  accent?: boolean;
}

function StatCard({ title, value, icon: Icon, isLoading, to, accent }: StatCardProps) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={accent ? "h-5 w-5 text-accent" : "h-5 w-5 text-primary"} />
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-semibold text-foreground">
            {isLoading ? "—" : value}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DashboardPage() {
  const { user } = UseAuth();

  const institutionsQuery = useInstitutionsQuery({ page: 1, limit: 1 });
  // /institution-types returns a plain array (no total), so we fetch a
  // generous limit and use its length as the count.
  const institutionTypesQuery = useInstitutionTypesQuery({ limit: 100 });
  const branchesQuery = useBranchesQuery({ page: 1, limit: 1 });
  const verificationQueueQuery = useBranchVerificationQueueQuery();
  const usersQuery = useUsersQuery({ page: 1, limit: 1 });
  const valuationEstimatesQuery = useValuationEstimatesQuery({ page: 1, limit: 1 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          Overview of institutions, branches, staff, and valuation activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Institutions"
          value={institutionsQuery.data?.total ?? 0}
          icon={IconBuildingBank}
          isLoading={institutionsQuery.isLoading}
          to="/institutions"
        />
        <StatCard
          title="Institution Types"
          value={institutionTypesQuery.data?.length ?? 0}
          icon={IconBuildingSkyscraper}
          isLoading={institutionTypesQuery.isLoading}
          to="/institution-types"
        />
        <StatCard
          title="Branches"
          value={branchesQuery.data?.total ?? 0}
          icon={IconBuildingSkyscraper}
          isLoading={branchesQuery.isLoading}
          to="/branches"
        />
        <StatCard
          title="Pending Verifications"
          value={verificationQueueQuery.data?.length ?? 0}
          icon={IconShieldCheck}
          isLoading={verificationQueueQuery.isLoading}
          to="/branches"
          accent
        />
        <StatCard
          title="Staff Users"
          value={usersQuery.data?.total ?? 0}
          icon={IconUsers}
          isLoading={usersQuery.isLoading}
          to="/users"
        />
        <StatCard
          title="Valuation Estimates"
          value={valuationEstimatesQuery.data?.total ?? 0}
          icon={IconCalculator}
          isLoading={valuationEstimatesQuery.isLoading}
          to="/valuation-estimates"
        />
      </div>
    </div>
  );
}
