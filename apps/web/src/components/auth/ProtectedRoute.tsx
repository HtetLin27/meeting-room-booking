import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router";

import { currentUserQueryOptions } from "@/api/auth.api";

export function ProtectedRoute() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    ...currentUserQueryOptions,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
