"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { useMemo } from "react";

export function useAuth() {
  const { token, user, setAuth, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuthStore();

  const login = async (email: string, password: string, tenantSlug: string) => {
    const data = await api.post("/users/login", { email, password }, tenantSlug) as {
      token: string;
      user: { id: string; name: string; email: string; role: string; tenantId?: string };
    };

    setAuth(data.token, data.user);
    localStorage.setItem("token", data.token);

    return data;
  };

  const register = async (name: string, email: string, password: string, tenantSlug: string) => {
    await api.post("/users/register", { name, email, password }, tenantSlug);
  };

  const authState = useMemo(() => ({
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
  }), [token, user, isAuthenticated, isAdmin, isSuperAdmin]);

  return {
    token,
    user,
    login,
    register,
    logout,
    ...authState,
  };
}
