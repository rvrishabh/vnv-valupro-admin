import {
  useBranchesQuery,
  useBranchVerificationQueueQuery,
} from "@/api/queries/branches";
import { useInstitutionTypesQuery } from "@/api/queries/institution-types";
import { useInstitutionsQuery } from "@/api/queries/institutions";
import { useUsersQuery } from "@/api/queries/users";
import { useValuationEstimatesQuery } from "@/api/queries/valuation-estimates";
import {
  IconBuildingBank,
  IconBuildingSkyscraper,
  IconCalculator,
  IconShieldCheck,
  IconUsers,
} from "@tabler/icons-react";
import { StatCard } from "./StatCard";

export function DashboardStats() {
  const institutionsQuery = useInstitutionsQuery({ page: 1, limit: 1 });
  // /institution-types returns a plain array (no total), so we fetch a
  // generous limit and use its length as the count.
  const institutionTypesQuery = useInstitutionTypesQuery({ limit: 100 });
  const branchesQuery = useBranchesQuery({ page: 1, limit: 1 });
  const verificationQueueQuery = useBranchVerificationQueueQuery();
  const usersQuery = useUsersQuery({ page: 1, limit: 1 });
  const valuationEstimatesQuery = useValuationEstimatesQuery({
    page: 1,
    limit: 1,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <StatCard
        title="Institutions"
        value={institutionsQuery.data?.total ?? 0}
        icon={IconBuildingBank}
        isLoading={institutionsQuery.isLoading}
        to="/settings/institutions"
      />
      <StatCard
        title="Institution Types"
        value={institutionTypesQuery.data?.length ?? 0}
        icon={IconBuildingSkyscraper}
        isLoading={institutionTypesQuery.isLoading}
        to="/settings/institution-types"
      />
      <StatCard
        title="Branches"
        value={branchesQuery.data?.total ?? 0}
        icon={IconBuildingSkyscraper}
        isLoading={branchesQuery.isLoading}
        to="/settings/branches"
      />
      <StatCard
        title="Pending Verifications"
        value={verificationQueueQuery.data?.length ?? 0}
        icon={IconShieldCheck}
        isLoading={verificationQueueQuery.isLoading}
        to="/settings/branches"
        accent
      />
      <StatCard
        title="Staff Users"
        value={usersQuery.data?.total ?? 0}
        icon={IconUsers}
        isLoading={usersQuery.isLoading}
        to="/settings/users"
      />
      <StatCard
        title="Valuation Estimates"
        value={valuationEstimatesQuery.data?.total ?? 0}
        icon={IconCalculator}
        isLoading={valuationEstimatesQuery.isLoading}
        to="/valuation-estimates"
      />
    </div>
  );
}
