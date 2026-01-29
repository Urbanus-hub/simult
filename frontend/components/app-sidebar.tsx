"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconSettings,
  IconUsers,
  IconMessage,
  IconChecklist,
  IconLayoutKanban,
  IconBell,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

// Static nav data structure generator
const getNavData = () => ({
  navMain: [
    {
      title: "Dashboard",
      url: "/user",
      icon: IconDashboard,
      isActive: true,
    },
    {
      title: "Rooms",
      url: "/rooms",
      icon: IconLayoutKanban,
      items: [
        {
          title: "My Rooms",
          url: "/rooms",
        },
        {
          title: "Create Room",
          url: "/rooms/create",
        },
        {
          title: "Invitations",
          url: "/rooms/invitations",
        },
      ],
    },
    {
      title: "Messages",
      url: "/messages",
      icon: IconMessage,
      items: [
        {
          title: "Direct Messages",
          url: "/messages/dm",
        },
        {
          title: "Room Chats",
          url: "/messages/rooms",
        },
      ],
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: IconChecklist,
      items: [
        {
          title: "My Tasks",
          url: "/tasks",
        },
        {
          title: "Assigned to Me",
          url: "/tasks/assigned",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Preferences",
          url: "/settings/preferences",
        },
      ],
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: IconBell,
    },
  ],
});

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const data = getNavData();

  // Transform auth user to sidebar user format
  const sidebarUser = {
    name: user?.displayName || user?.username || "Guest",
    email: user?.email || "",
    avatar: user?.avatar === "/" ? "" : user?.avatar || "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/user">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <IconUsers className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Simult</span>
                  <span className="truncate text-xs">Collaboration</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
