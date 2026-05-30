import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getDefaultPathByRole } from "@/app/layout/navigation";

export function RoleIndexRedirect() {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultPathByRole(session.role)} replace />;
}
