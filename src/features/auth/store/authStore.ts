import { create } from "zustand";
import { demoAccounts } from "@/features/auth/data/demoAccounts";
import {
  clearSession,
  loadSession,
  saveSession
} from "@/features/auth/services/authStorage";
import type { AuthSession, UserRole } from "@/types/auth";

type LoginPayload = {
  username: string;
  password: string;
};

type AuthState = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => {
  const initialSession = loadSession();

  return {
    session: initialSession,
    isAuthenticated: Boolean(initialSession),
    login: async ({ username, password }) => {
      const matched = demoAccounts.find(
        (account) =>
          account.username === username.trim() &&
          account.password === password.trim()
      );

      if (!matched) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
      }

      const nextSession: AuthSession = {
        accountId: matched.id,
        fullName: matched.fullName,
        username: matched.username,
        role: matched.role,
        loginAt: new Date().toISOString()
      };

      saveSession(nextSession);
      set({
        session: nextSession,
        isAuthenticated: true
      });
    },
    logout: () => {
      clearSession();
      set({ session: null, isAuthenticated: false });
    },
    hasRole: (roles) => {
      const role = get().session?.role;
      return role ? roles.includes(role) : false;
    }
  };
});
