"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

export function useAuth() {
  const { token, user, setAuth, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuthStore();

  const login = async (email: string, password: string, tenantSlug: string) => {
    const data = await api.post("/users/login", { email, password }, tenantSlug) as {
      token: string;
      user: { id: string; name: string; email: string; role: string; tenantId?: string };
    };

    setAuth(data.token, data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("userRole", data.user.role);

    return data;
  };

  const register = async (name: string, email: string, password: string, tenantSlug: string) => {
    await api.post("/users/register", { name, email, password }, tenantSlug);
  };

  return {
    token,
    user,
    login,
    register,
    logout,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
  };
}
