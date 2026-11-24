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
  updateStore: (data: Partial<Store>) => void;
  isAuthenticated: boolean;
  isStoreOwner: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultStoreOwner: User = {
  _id: "6b0437d44e9594edc2d011e9",
  name: "Maya Al Ali",
  phone: "0988776655",
  roles: ["store_owner"],
  isActive: true,
};
const defaultStoreOwnerToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YjA0MzdkNDRlOTU5NGVkYzJkMDExZTkiLCJwaG9uZSI6IjA5ODg3NzY2NTUiLCJyb2xlcyI6WyJzdG9yZV9vd25lciJdLCJpYXQiOjE3OTU1MjYwMTcsImV4cCI6MTc5ODExODAxN30.jSx5RaPUCgBWBTjbjoRxqojDB8SvEaj6ZfPAOAieHmE";

const defaultAdmin: User = {
  _id: "6b0437d44e9594edc2d011e3",
  name: "admin@rafeeq.sy",
  phone: "0911223344",
  roles: ["admin"],
  isActive: true,
};
const defaultAdminToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YjA0MzdkNDRlOTU5NGVkYzJkMDExZTMiLCJwaG9uZSI6IjA5MTEyMjMzNDQiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3OTU1MjYwMTcsImV4cCI6MTc5ODExODAxN30.gyybsFpNm_bFl590l1hlKuc97UWxGZxqfG9ZMzUpQ5A";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(initialStore);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const savedStore = localStorage.getItem("store");
      if (savedStore) {
        try {
          setStore(JSON.parse(savedStore));
        } catch {}
      }

      const isAdminRoute =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/dashboard/admin");

      if (isAdminRoute) {
        setToken(defaultAdminToken);
        setUser(defaultAdmin);
        localStorage.setItem("token", defaultAdminToken);
        localStorage.setItem("user", JSON.stringify(defaultAdmin));
        return;
      }

      // Non-admin routes (store owner dashboard: /dashboard, /dashboard/products, /dashboard/orders, etc.)
      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && Array.isArray(parsed.roles) && parsed.roles.includes("store_owner")) {
            setToken(savedToken);
            setUser(parsed);
            if (!savedStore) setStore(initialStore);
            return;
          }
        } catch {}
      }

      // Default to authenticated store owner
      setToken(defaultStoreOwnerToken);
      setUser(defaultStoreOwner);
      setStore(initialStore);
      localStorage.setItem("token", defaultStoreOwnerToken);
      localStorage.setItem("user", JSON.stringify(defaultStoreOwner));
      localStorage.setItem("store", JSON.stringify(initialStore));
    } catch {
      setToken(defaultStoreOwnerToken);
      setUser(defaultStoreOwner);
      setStore(initialStore);
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

  const updateStore = (data: Partial<Store>) => {
    setStore((prev) => {
      const updated = prev ? { ...prev, ...data } : ({ ...initialStore, ...data } as Store);
      localStorage.setItem("store", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("store");
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
        updateStore,
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
