import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/features/auth/hooks/useAuth";

type ProtectedRouteProps = {
  allowRoles?: UserRole[];
};

export function ProtectedRoute({ allowRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated || !session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowRoles && !allowRoles.includes(session.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
