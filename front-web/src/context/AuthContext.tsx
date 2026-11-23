"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types/auth";
import { Store } from "@/types/store";
import { initialStore, initialOwnerUser } from "@/services/mockData";

export type AuthUser = User;
export type { User };

interface AuthContextType {
  user: User | null;
  store: Store | null;
  token: string | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isStoreOwner: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(initialStore);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Default session for smooth evaluation during local presentations
        setToken("mock_jwt_token_owner_rafeeq");
        setUser(initialOwnerUser);
      }
    } catch {
      setUser(initialOwnerUser);
    } finally {
      setHydrated(true);
    }
  }, []);

  const login = (newToken: string, userData?: User) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.roles?.includes("store_owner")) {
        setStore(initialStore);
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isStoreOwner = Boolean(user?.roles?.includes("store_owner"));
  const isAdmin = Boolean(user?.roles?.includes("admin"));

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isStoreOwner,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
