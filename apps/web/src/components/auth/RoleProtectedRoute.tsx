import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router";

import { currentUserQueryOptions, type UserRole } from "@/api/auth.api";

type RoleProtectedRouteProps = {
  allowedRoles: UserRole[];
};

export function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    ...currentUserQueryOptions,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#667085]">Loading...</p>
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/bookings" replace />;
  }

  return <Outlet />;
}
