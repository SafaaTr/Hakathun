"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, User, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TopBar() {
  const pathname = usePathname();
  const { user, store, isAdmin } = useAuth();

  const getPageTitle = () => {
    if (pathname.includes("/products")) return "My Products";
    if (pathname.includes("/orders")) return "Purchase Orders";
    if (pathname.includes("/profile")) return "Profile";
    if (pathname.includes("/admin/stores")) return "Stores Management";
    if (pathname.includes("/admin/doctors")) return "Doctors Management";
    if (pathname.includes("/admin/hosts")) return "Host Caregivers";
    if (pathname.includes("/admin/pet-owners")) return "Pet Owners";
    return "Home";
  };

  return (
    <header className="h-18 bg-card border-b border-card-border px-8 flex items-center justify-between shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <span>Workspace</span>
        <span>/</span>
        <span className="text-foreground/80">
          {isAdmin ? "Admin Console" : (store?.name || "Happy Paws")}
        </span>
        <span>/</span>
        <span className="font-bold text-navy dark:text-yellow">{getPageTitle()}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Role badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream dark:bg-card border border-card-border text-xs font-semibold text-foreground">
          {isAdmin ? (
            <>
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span>Admin</span>
            </>
          ) : (
            <>
              <Store className="w-4 h-4 text-blue" />
              <span>Store owner</span>
            </>
          )}
        </div>

        {/* Profile icon */}
        <Link
          href="/dashboard/profile"
          className="w-9 h-9 rounded-full bg-cream dark:bg-card border border-card-border flex items-center justify-center text-foreground/80 hover:text-foreground hover:border-yellow transition-colors"
          title={user?.name || "Profile"}
        >
          <User className="w-4 h-4" />
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
