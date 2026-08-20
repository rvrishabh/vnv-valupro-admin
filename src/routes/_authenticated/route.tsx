import logoIcon from "@/assets/logo-icon.png";
import logoFull from "@/assets/logo-full.png";
import { AppSideBar } from "@/components/SideNav/AppSidebar";
import type { NavMainItem } from "@/components/SideNav/NavMain";
import { SiteHeader } from "@/components/SideNav/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UseAuth } from "@/hooks/useAuth";
import {
  IconBuildingBank,
  IconBuildingSkyscraper,
  IconCalculator,
  IconFileText,
  IconLayoutDashboard,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const menuItems: NavMainItem[] = [
  { title: "Dashboard", url: "/", icon: IconLayoutDashboard },
  { title: "Users", url: "/users", icon: IconUsers },
  { title: "Roles", url: "/roles", icon: IconShieldLock },
  {
    title: "Institutions",
    url: "/institutions",
    icon: IconBuildingBank,
  },
  {
    title: "Institution Types",
    url: "/institution-types",
    icon: IconBuildingSkyscraper,
  },
  { title: "Branches", url: "/branches", icon: IconBuildingSkyscraper },
  {
    title: "Valuation Estimates",
    url: "/valuation-estimates",
    icon: IconCalculator,
  },
  { title: "Valuations", url: "/valuations", icon: IconFileText },
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
        user={{ name: user?.name ?? undefined, email: user?.email ?? undefined }}
        onLogout={handleLogout}
      />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
