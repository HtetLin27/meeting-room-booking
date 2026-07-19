import { Navigate, Route, Routes } from "react-router";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

import { AppLayout } from "@/layouts/AppLayout";

import { BookingsPage } from "@/pages/bookings/BookingsPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { UsersPage } from "@/pages/users/UsersPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* All authenticated users */}
          <Route path="/bookings" element={<BookingsPage />} />

          {/* Admin only */}
          <Route element={<RoleProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Admin + Owner */}
          <Route
            element={<RoleProtectedRoute allowedRoles={["ADMIN", "OWNER"]} />}
          >
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/bookings" replace />} />
    </Routes>
  );
}

export default App;
