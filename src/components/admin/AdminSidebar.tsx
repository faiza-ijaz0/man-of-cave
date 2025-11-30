'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Building,
  UserPlus,
  Bell,
  Image,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Menu,
  Scissors,
  Package,
  ShoppingCart,
  Star,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  PieChart,
  Activity,
  Target,
  Award,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  role: 'branch_admin' | 'super_admin';
  onLogout: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const branchAdminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    title: 'Appointments',
    href: '/admin/appointments',
    icon: Calendar,
  },
  {
    title: 'Staff',
    href: '/admin/staff',
    icon: Users,
  },
  {
    title: 'Services',
    href: '/admin/services',
    icon: Scissors,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

const superAdminNavItems = [
  {
    title: 'Dashboard',
    href: '/super-admin',
    icon: BarChart3,
  },
  {
    title: 'Branches',
    href: '/super-admin/branches',
    icon: Building,
  },
  {
    title: 'All Appointments',
    href: '/super-admin/appointments',
    icon: Calendar,
  },
  {
    title: 'Staff Management',
    href: '/super-admin/staff',
    icon: Users,
  },
  {
    title: 'Services',
    href: '/super-admin/services',
    icon: Scissors,
  },
  {
    title: 'Products',
    href: '/super-admin/products',
    icon: Package,
  },
  {
    title: 'Mobile App',
    href: '/mobile-app',
    icon: Phone,
  },
  {
    title: 'CMS',
    href: '/cms',
    icon: FileText,
  },
  {
    title: 'Analytics',
    href: '/super-admin/analytics',
    icon: PieChart,
  },
  {
    title: 'Financial',
    href: '/super-admin/financial',
    icon: DollarSign,
  },
  {
    title: 'Settings',
    href: '/super-admin/settings',
    icon: Settings,
  },
];

function SidebarContent({ role, onLogout, onToggle, isCollapsed = false }: Omit<SidebarProps, 'isOpen'> & { isCollapsed?: boolean }) {
  const pathname = usePathname();
  const navItems = role === 'super_admin' ? superAdminNavItems : branchAdminNavItems;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 lg:px-6">
        <div className="flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            {!isCollapsed && (
              <span className="text-lg lg:text-xl font-serif font-bold text-primary">Premium Cuts</span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="lg:hidden"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            )}
            {onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="hidden lg:flex"
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    isCollapsed && "justify-center px-0",
                    isActive && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.title}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-3",
            isCollapsed && "justify-center px-0"
          )}
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}

export function AdminSidebar({ role, onLogout, isOpen = true, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform bg-white border-r transition-all duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0",
        // Mobile: slide in/out completely
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        // Desktop: collapse to narrow width
        "lg:w-16 lg:translate-x-0",
        isOpen && "lg:w-64"
      )}>
        <SidebarContent role={role} onLogout={onLogout} onToggle={onToggle} isCollapsed={!isOpen} />
      </div>
    </>
  );
}

export function AdminMobileSidebar({ role, onLogout, isOpen, onToggle }: SidebarProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className="lg:hidden"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}