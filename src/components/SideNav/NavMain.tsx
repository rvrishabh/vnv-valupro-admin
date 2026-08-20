import { useLocation, useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

/**
 * The menu mixes Tabler and Lucide icons. Their exported types disagree on the
 * ref (Tabler refs an `Icon`, Lucide an `SVGSVGElement`), so neither library's
 * type accepts the other. Only the props this component actually passes are
 * required here, which both satisfy.
 */
export type NavIcon = ComponentType<{ className?: string }>;

export interface NavMainItem {
  title: string;
  url: string;
  icon?: NavIcon;
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className="cursor-pointer"
                onClick={() => navigate({ to: item.url })}
                isActive={
                  item.url === "/"
                    ? currentPath === "/"
                    : currentPath.startsWith(item.url)
                }
                asChild
              >
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon />}
                  <div className="font-semibold">{item.title}</div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
