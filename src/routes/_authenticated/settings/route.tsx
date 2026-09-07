import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SettingsNav } from "./-components/SettingsNav";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Institutions, branches, staff access, and the rules the valuation
          engine runs on.
        </p>
      </div>
      <SettingsNav />
      <Outlet />
    </div>
  );
}
