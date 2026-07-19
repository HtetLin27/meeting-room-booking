import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useNavigate } from "react-router";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  currentUserQueryKey,
  currentUserQueryOptions,
  logout,
  type UserRole,
} from "@/api/auth.api";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavigationItem = {
  label: string;
  path: string;
  icon: ComponentType<{
    className?: string;
  }>;
  roles?: UserRole[];
};

const navigationItems: NavigationItem[] = [
  {
    label: "Bookings",
    path: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "OWNER"],
  },
];

const SIDEBAR_STORAGE_KEY = "meeting-room-sidebar-expanded";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedValue = localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (savedValue === null) {
      return false;
    }

    return savedValue === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarExpanded));
  }, [isSidebarExpanded]);

  const { data: user } = useQuery(currentUserQueryOptions);

  const logoutMutation = useMutation({
    mutationFn: logout,

    onSuccess: async () => {
      await queryClient.cancelQueries({
        queryKey: currentUserQueryKey,
      });

      queryClient.setQueryData(currentUserQueryKey, null);

      queryClient.removeQueries({
        queryKey: ["bookings"],
      });

      queryClient.removeQueries({
        queryKey: ["users"],
      });

      queryClient.removeQueries({
        queryKey: ["usage-report"],
      });

      toast.success("Logged out successfully");

      navigate("/login", {
        replace: true,
      });
    },

    onError: () => {
      toast.error("Unable to log out");
    },
  });

  if (!user) {
    return null;
  }

  const visibleNavigation = navigationItems.filter((item) => {
    if (!item.roles) {
      return true;
    }

    return item.roles.includes(user.role);
  });

  const renderSidebar = (expanded: boolean) => (
    <div className="flex h-full flex-col bg-[#FFFFFF]">
      <div
        className={cn(
          "flex h-16 items-center border-b border-[#E4E7EC]",
          expanded ? "gap-3 px-6" : "justify-center px-0"
        )}
      >
        <div className="flex size-8 items-center justify-center rounded-md bg-[#EEF5FF]">
          <CalendarDays className="size-5 text-[#0355DD]" />
        </div>

        {expanded && (
          <span className="text-base font-semibold text-[#101828]">
            Room Booking
          </span>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1 py-6", expanded ? "px-4" : "px-3")}>
        {visibleNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={expanded ? undefined : item.label}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                [
                  cn(
                    "flex h-11 items-center rounded-md text-sm font-medium transition-colors",
                    expanded ? "gap-3 px-4" : "justify-center px-0"
                  ),
                  isActive
                    ? "bg-[#EEF5FF] text-[#0355DD]"
                    : "text-[#344054] hover:bg-[#F9FAFB] hover:text-[#101828]",
                ].join(" ")
              }
            >
              <Icon className="size-5" />

              {expanded && item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-[#E4E7EC] p-4">
        <Button
          type="button"
          variant="outline"
          title={
            expanded
              ? undefined
              : logoutMutation.isPending
                ? "Logging out..."
                : "Logout"
          }
          className={cn(
            "h-9 w-full border-[#E4E7EC] text-[#344054] hover:bg-[#F9FAFB]",
            expanded ? "justify-start" : "justify-center px-0"
          )}
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="size-4" />

          {expanded && (logoutMutation.isPending ? "Logging out..." : "Logout")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[#E4E7EC] bg-[#FFFFFF] transition-all duration-300 lg:block",
          isSidebarExpanded ? "w-60" : "w-[72px]"
        )}
      >
        <button
          type="button"
          aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-3 top-6 z-10 flex size-7 items-center justify-center rounded-full border border-[#E4E7EC] bg-[#FFFFFF] text-[#667085] shadow-sm transition-colors hover:bg-[#F9FAFB]"
          onClick={() => setIsSidebarExpanded((expanded) => !expanded)}
        >
          {isSidebarExpanded ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        {renderSidebar(isSidebarExpanded)}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-72 border-r border-[#E4E7EC] bg-[#FFFFFF] shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 rounded-md p-2 text-[#344054] hover:bg-[#F9FAFB]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="size-5" />
            </button>

            {renderSidebar(true)}
          </aside>
        </div>
      )}

      <div
        className={cn(
          "transition-all duration-300",
          isSidebarExpanded ? "lg:pl-60" : "lg:pl-[72px]"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E4E7EC] bg-[#FFFFFF] px-4 md:px-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#344054] hover:bg-[#F9FAFB] lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#EEF5FF] text-sm font-semibold text-[#344054]">
              {getInitials(user.name)}
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#101828]">
                {user.name}
              </p>

              <p className="text-xs font-medium text-[#667085]">{user.role}</p>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
