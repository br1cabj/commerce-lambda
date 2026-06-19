import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId?: string;
  } | null;
  setAuth: (token: string, user: AuthState["user"]) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      logout: () => {
        set({ token: null, user: null });
      },

      isAuthenticated: () => !!get().token,

      isAdmin: () => {
        const user = get().user;
        return user?.role === "admin" || user?.role === "administrador";
      },

      isSuperAdmin: () => {
        const user = get().user;
        return user?.role === "super_admin";
      },
    }),
    { name: "auth-storage" },
  ),
);
