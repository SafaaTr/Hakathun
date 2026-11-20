"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type AuthUser = Record<string, unknown>;

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, userData?: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAuthUser(value: unknown): value is AuthUser {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // جلب التوكن والـ User المخزنين عند الإقلاع
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken) {
      // Browser storage is only available after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken);
      if (savedUser) {
        const parsedUser: unknown = JSON.parse(savedUser);
        if (isAuthUser(parsedUser)) setUser(parsedUser);
      }
    }
  }, []);

  const login = (newToken: string, userData?: AuthUser) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};