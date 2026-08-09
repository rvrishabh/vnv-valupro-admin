import { IconLogout2 } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

export interface User {
  email: string | undefined;
  name?: string | undefined;
  avatar?: string | undefined;
}

interface NavUserProps {
  user: User;
  onLogout?: () => void;
}

function getInitials(name?: string): string {
  if (!name) return "A";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function NavUser({ user, onLogout }: NavUserProps) {
  return (
    <SidebarMenu className="mt-2">
      <SidebarMenuItem>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-sidebar-accent text-sidebar-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="truncate font-medium text-base">{user.name}</div>
            <div className="truncate text-xs">{user.email}</div>
          </div>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem className="mt-1">
        <SidebarMenuButton
          className="w-full cursor-pointer"
          tooltip={"Sign out"}
          onClick={onLogout}
        >
          <IconLogout2 className="h-12 w-12" />
          <span className="text-base">Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
