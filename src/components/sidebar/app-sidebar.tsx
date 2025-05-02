'use client';

import * as React from 'react';
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  CameraIcon,
  ClipboardListIcon,
  Clock,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  InboxIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';

import { NavDocuments } from '@/components/sidebar/nav-documents';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavAppointment } from '@/components/sidebar/nav-appointment';
import { NavUser } from '@/components/sidebar/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const data = {
  appointment: [
    {
      title: 'Dashboard',
      url: '/dashboard/appointment',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'All Appointments',
      url: '/dashboard/appointment/appointments',
      icon: Clock,
    },
    {
      title: "Today's Appointments",
      url: '/dashboard/appointment/appointments/today',
      icon: Clock,
    },
    {
      title: 'View All Slots',
      url: '/dashboard/appointment/slots',
      icon: CalendarDays,
    },
  ],

  navMain: [
    {
      title: 'Inbox',
      url: '/dashboard',
      icon: InboxIcon,
    },

    {
      title: 'Blog',
      url: '/dashboard/blogs',
      icon: BarChartIcon,
    },
    {
      title: 'Notice Board',
      url: '/dashboard/noticeBoard',
      icon: FolderIcon,
    },
    {
      title: 'Gallery',
      url: '/dashboard/gallery',
      icon: UsersIcon,
    },
    {
      title: 'Job Application',
      icon: CameraIcon,
      url: '/dashboard/JobApplications',
    },
  ],

  documents: [
    {
      name: 'Home',
      url: '/',
      icon: DatabaseIcon,
    },
    {
      name: 'Gallery',
      url: '/gallery',
      icon: ClipboardListIcon,
    },
    {
      name: 'Blog',
      url: '/blog',
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavAppointment items={data.appointment} />
        <NavMain items={data.navMain} />

        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
