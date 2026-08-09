import { useLocation, useNavigate } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
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
