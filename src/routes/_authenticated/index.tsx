import { UseAuth } from "@/hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardStats } from "./-components/DashboardStats";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = UseAuth();

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

      <DashboardStats />
    </div>
  );
}
