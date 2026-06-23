"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { useCallback, useState, useEffect } from "react";

function useIsHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);
  return hydrated;
}

export function useAuth() {
  const isHydrated = useIsHydrated();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logoutStore = useAuthStore((s) => s.logout);

  const login = useCallback(
    async (email: string, password: string, tenantSlug: string) => {
      const data = (await api.post(
        "/users/login",
        { email, password },
        tenantSlug,
      )) as {
        token: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          tenantId?: string;
        };
      };

      setAuth(data.token, data.user);
      localStorage.setItem("token", data.token);

      return data;
    },
    [setAuth],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      tenantSlug: string,
    ) => {
      await api.post(
        "/users/register",
        { name, email, password },
        tenantSlug,
      );
    },
    [],
  );

  const logout = useCallback(() => {
    logoutStore();
  }, [logoutStore]);

  const isAuthenticated = isHydrated && !!token;
  const isAdmin = isHydrated && (user?.role === "admin" || user?.role === "administrador");
  const isSuperAdmin = isHydrated && user?.role === "super_admin";

  return {
    token: isHydrated ? token : null,
    user: isHydrated ? user : null,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isHydrated,
  };
}
