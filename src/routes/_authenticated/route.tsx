import logoFull from "@/assets/logo-full.png";
import logoIcon from "@/assets/logo-icon.png";
import { AppSideBar } from "@/components/SideNav/AppSidebar";
import type { NavMainItem } from "@/components/SideNav/NavMain";
import { SiteHeader } from "@/components/SideNav/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UseAuth } from "@/hooks/useAuth";
import {
  IconCalculator,
  IconFolders,
  IconLayoutDashboard,
  IconSettings,
} from "@tabler/icons-react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Institutions, Institution Types, Branches, Users, Roles and Circle Rate
// Uplift live under /settings — see routes/_authenticated/settings/route.tsx
// for that section's own sub-nav — rather than each getting a top-level entry
// here.
const menuItems: NavMainItem[] = [
  { title: "Dashboard", url: "/", icon: IconLayoutDashboard },
  { title: "Cases", url: "/cases", icon: IconFolders },
  {
    title: "Valuation Estimates",
    url: "/valuation-estimates",
    icon: IconCalculator,
  },
  { title: "Settings", url: "/settings", icon: IconSettings },
];

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, logout } = UseAuth();

  const handleLogout = async () => {
    await logout();
    // Hard redirect to avoid racing the router's `auth` context (see the
    // matching note in routes/login.tsx).
    window.location.href = "/login";
  };

  return (
    <SidebarProvider>
      <AppSideBar
        menuItems={menuItems}
        logo={logoFull}
        logoIcon={logoIcon}
        iconClassName="h-8 w-auto max-w-[9rem] object-contain"
        to="/"
        user={{
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
        }}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <SiteHeader />
        {/* min-h-0 lets this flex child shrink below its content's natural
            height — without it, a tall page just grows the container instead
            of triggering overflow-y-auto, and the window scrolls again. */}
        <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
