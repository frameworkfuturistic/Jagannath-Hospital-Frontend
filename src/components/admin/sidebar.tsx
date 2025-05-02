'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  BarChart4,
  Settings,
  Menu,
  X,
  CalendarPlus,
  CalendarRange,
  CalendarDays,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Slots',
      href: '/admin/slots',
      icon: <Calendar className="h-5 w-5" />,
      submenu: [
        {
          title: 'View All Slots',
          href: '/admin/slots',
          icon: <CalendarDays className="h-4 w-4" />,
        },
        {
          title: 'Add Slot',
          href: '/admin/slots/add',
          icon: <CalendarPlus className="h-4 w-4" />,
        },
        {
          title: 'Add Slot Range',
          href: '/admin/slots/range',
          icon: <CalendarRange className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Appointments',
      href: '/admin/appointments',
      icon: <Clock className="h-5 w-5" />,
      submenu: [
        {
          title: 'All Appointments',
          href: '/admin/appointments',
          icon: <Clock className="h-4 w-4" />,
        },
        {
          title: "Today's Appointments",
          href: '/admin/appointments/today',
          icon: <Clock className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Doctors',
      href: '/admin/doctors',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: <BarChart4 className="h-5 w-5" />,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 px-6">
            <h2 className="text-xl font-bold text-gray-800">Hospital Admin</h2>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href} className="space-y-1">
                    <Link
                      prefetch={true}
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )}
                      onClick={closeSidebar}
                    >
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </Link>

                    {item.submenu && isActive && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.submenu.map((subitem) => {
                          const isSubActive = pathname === subitem.href;

                          return (
                            <li key={subitem.href}>
                              <Link
                                prefetch={true}
                                href={subitem.href}
                                className={cn(
                                  'flex items-center px-3 py-2 text-xs font-medium rounded-md',
                                  isSubActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                )}
                                onClick={closeSidebar}
                              >
                                {subitem.icon}
                                <span className="ml-3">{subitem.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  A
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs font-medium text-gray-500">
                  admin@hospital.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
