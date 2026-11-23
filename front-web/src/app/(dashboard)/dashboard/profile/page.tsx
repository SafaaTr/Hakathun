"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, User, Phone, MapPin, ShieldCheck, LogOut, Coins } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { useAuth } from "@/context/AuthContext";

export default function StoreProfilePage() {
  const router = useRouter();
  const { user, store, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Store Profile
        </h1>
        <p className="text-sm text-muted">
          Your registered store details and workspace account configuration.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-card border border-card-border rounded-3xl p-8 shadow-xs space-y-8">
        {/* Store Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-card-border gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow/20 border border-yellow/30 flex items-center justify-center text-navy dark:text-yellow shrink-0">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">
                {store?.name || "Happy Paws Pet Store"}
              </h2>
              <p className="text-xs font-semibold text-muted">
                Store ID: {store?._id || "store_001"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Store</span>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Owner Name */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <User className="w-4 h-4 text-blue" />
              <span>Owner Name</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {user?.name || "Maya Al Ali"}
            </p>
          </div>

          {/* Registered Phone */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <Phone className="w-4 h-4 text-yellow" />
              <span>Contact Phone</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {store?.phone || user?.phone || "0988776655"}
            </p>
          </div>

          {/* Location / Address */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Physical Address</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {store?.address || "Al-Mazzeh, Damascus"}
            </p>
          </div>

          {/* Operating Currency */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>Currency & Billing</span>
            </div>
            <p className="text-base font-bold text-foreground">
              New SYP (الليرة السورية الجديدة)
            </p>
          </div>
        </div>

        {/* Account Role & Permissions */}
        <div className="p-5 rounded-2xl border border-card-border bg-card space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-navy dark:text-yellow" />
            <span>Assigned Platform Roles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-navy text-white text-xs font-bold">
              store_owner
            </span>
            <span className="text-xs text-muted">
              Full permissions to manage store inventory, prices, and customer purchase orders.
            </span>
          </div>
        </div>

        {/* Logout Section (FR-09) */}
        <div className="pt-4 border-t border-card-border flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Sign out of workspace</p>
            <p className="text-xs text-muted">
              End your current authenticated session on this computer.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={() => setIsLogoutModalOpen(true)}
            className="gap-2 font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* FR-09 Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
