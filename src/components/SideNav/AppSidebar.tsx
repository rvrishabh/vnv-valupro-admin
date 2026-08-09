import { useRouter } from "@tanstack/react-router";
import React from "react";
import { cn } from "../../lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import { NavMain, type NavMainItem } from "./NavMain";
import { type User } from "./NavUser";
interface SidebarShellProps extends React.ComponentProps<typeof Sidebar> {
  menuItems: NavMainItem[];
  logo?: string;
  footerContent?: React.ReactNode;
  user?: User;
  onLogout?: () => void;
  appName?: string;
  iconClassName?: string;
  to?: string;
}

export function AppSideBar({
  menuItems,
  logo,
  appName,
  iconClassName,
  to,
  ...props
}: SidebarShellProps) {
  const { navigate } = useRouter();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:!bg-transparent"
            >
              {logo ? (
                <img
                  src={logo}
                  alt="logo"
                  className={cn("cursor-pointer", iconClassName)}
                  onClick={() => {
                    navigate({ to: `${to}` });
                  }}
                />
              ) : (
                <span className="text-2xl font-bold">App</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex justify-center">
            {appName && state === "expanded" && (
              <div className="text-xl font-bold text-center text-primary">
                {appName}
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pt-4 pb-4">
        <NavMain items={menuItems} />
      </SidebarContent>

      {/* <SidebarFooter className="pb-4 px-2 flex flex-col gap-2">
        <NavUser
          onLogout={onLogout}
          user={{
            name: user?.name || "WCTPay Admin",
            email: user?.email || "guest@example.com",
            avatar: "https://github.com/shadcn.png",
          }}
        />
      </SidebarFooter> */}
    </Sidebar>
  );
}
