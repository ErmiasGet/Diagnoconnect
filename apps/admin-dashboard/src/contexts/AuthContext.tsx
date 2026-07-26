import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/utils";
import type { AdminUser } from "../types";

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_access_token");
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get("/auth/profile");
      setUser(data.data);
    } catch {
      setUser(null);
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("admin_access_token", data.data.accessToken);
    localStorage.setItem("admin_refresh_token", data.data.refreshToken);
    setUser(data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
