import { cn } from "@/lib/utils";
import {
  IconBuildingBank,
  IconBuildingSkyscraper,
  IconPercentage,
  IconShieldLock,
  IconUsers,
} from "@tabler/icons-react";
import { Link, useLocation } from "@tanstack/react-router";

const SETTINGS_NAV_ITEMS = [
  { title: "Institutions", url: "/settings/institutions", icon: IconBuildingBank },
  {
    title: "Institution Types",
    url: "/settings/institution-types",
    icon: IconBuildingSkyscraper,
  },
  { title: "Branches", url: "/settings/branches", icon: IconBuildingSkyscraper },
  { title: "Users", url: "/settings/users", icon: IconUsers },
  { title: "Roles", url: "/settings/roles", icon: IconShieldLock },
  {
    title: "Circle Rate Uplift",
    url: "/settings/circle-rate-uplift",
    icon: IconPercentage,
  },
] as const;

export function SettingsNav() {
  const location = useLocation();

  return (
    <nav className="flex flex-wrap gap-1 border-b pb-2">
      {SETTINGS_NAV_ITEMS.map((item) => {
        const isActive = location.pathname.startsWith(item.url);
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
