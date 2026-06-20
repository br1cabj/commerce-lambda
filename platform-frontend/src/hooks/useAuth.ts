"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { useMemo, useState, useEffect } from "react";

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const store = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const login = async (email: string, password: string, tenantSlug: string) => {
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

    store.setAuth(data.token, data.user);
    localStorage.setItem("token", data.token);

    return data;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    tenantSlug: string,
  ) => {
    await api.post("/users/register", { name, email, password }, tenantSlug);
  };

  const authState = useMemo(
    () => ({
      isAuthenticated: isHydrated ? store.isAuthenticated() : false,
      isAdmin: isHydrated ? store.isAdmin() : false,
      isSuperAdmin: isHydrated ? store.isSuperAdmin() : false,
    }),
    [store, isHydrated],
  );

  return {
    token: isHydrated ? store.token : null,
    user: isHydrated ? store.user : null,
    login,
    register,
    logout: store.logout,
    ...authState,
    isHydrated,
  };
}
