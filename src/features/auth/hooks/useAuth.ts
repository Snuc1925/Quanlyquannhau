import { useAuthStore } from "@/features/auth/store/authStore";

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const hasRole = useAuthStore((state) => state.hasRole);

  return {
    session,
    isAuthenticated,
    login,
    logout,
    hasRole
  };
}
