"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, User, Phone, MapPin, ShieldCheck, LogOut, Coins, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, store, isAdmin, logout, login } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState(user?.name || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editPassword, setEditPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleOpenEdit = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditPassword("");
    setSaveSuccess(null);
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    const cleanPhone = editPhone.trim().replace(/[\s-]/g, "");
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setSaveError("Invalid phone number. Must be a 10-digit Syrian mobile starting with 09 (e.g. 0911223344).");
      return;
    }

    if (editPassword && editPassword.length < 8) {
      setSaveError("Password must be at least 8 characters long.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: editName.trim(),
        phone: cleanPhone,
      };
      if (editPassword.trim()) {
        payload.password = editPassword.trim();
      }

      await api.patch("/me/profile", payload);

      const updatedUser = {
        ...(user || {}),
        name: editName.trim(),
        phone: cleanPhone,
      };

      const token = localStorage.getItem("token") || "";
      login(token, updatedUser as any);

      setSaveSuccess("Profile details updated successfully.");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(null);
      }, 1200);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {isAdmin ? "Administrator Profile" : "Store Profile"}
          </h1>
          <p className="text-sm text-muted">
            {isAdmin
              ? "Your platform administration account and security configuration."
              : "Your registered store details and workspace account configuration."}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenEdit}
          className="gap-2 font-bold self-start sm:self-auto shadow-xs"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Main Profile Card */}
      <div className="bg-card border border-card-border rounded-3xl p-8 shadow-xs space-y-8">
        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-card-border gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow/20 border border-yellow/30 flex items-center justify-center text-navy dark:text-yellow shrink-0">
              {isAdmin ? <ShieldCheck className="w-8 h-8" /> : <Store className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">
                {isAdmin ? (user?.name || "System Administrator") : (store?.name || "Happy Paws Pet Store")}
              </h2>
              <p className="text-xs font-semibold text-muted">
                {isAdmin ? `Admin ID: ${user?._id || (user as any)?.id || "admin_001"}` : `Store ID: ${store?._id || "store_001"}`}
              </p>
            </div>
          </div>

          {/* High-contrast solid Active Badge (Visible in both Light and Dark mode) */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs border border-emerald-700 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{isAdmin ? "Active Administrator" : "Active Store"}</span>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <User className="w-4 h-4 text-blue" />
              <span>{isAdmin ? "Admin Full Name" : "Owner Name"}</span>
            </div>
            <p className="text-base font-bold text-foreground">
              {user?.name || (isAdmin ? "admin@rafeeq.sy" : "Maya Al Ali")}
            </p>
          </div>

          {/* Contact Phone */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <Phone className="w-4 h-4 text-yellow" />
              <span>Contact Phone</span>
            </div>
            <p className="text-base font-bold text-foreground font-mono">
              {user?.phone || store?.phone || (isAdmin ? "0911223344" : "0988776655")}
            </p>
          </div>

          {/* Address (Store) or Account Type (Admin) */}
          {isAdmin ? (
            <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Authority Scope</span>
              </div>
              <p className="text-base font-bold text-foreground">
                Central Platform Administration
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Physical Address</span>
              </div>
              <p className="text-base font-bold text-foreground">
                {store?.address || "Al-Mazzeh, Damascus"}
              </p>
            </div>
          )}

          {/* Operating Currency (Clean standard label without Syrian currency Arabic note) */}
          <div className="p-4 rounded-2xl bg-cream/30 dark:bg-card-border/20 border border-card-border/60 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>Operating Currency</span>
            </div>
            <p className="text-base font-bold text-foreground font-mono">
              SYP (Syrian Pound)
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
              {isAdmin ? "admin" : "store_owner"}
            </span>
            <span className="text-xs text-muted">
              {isAdmin
                ? "Super Administrator: Full privileges to manage stores, veterinarians, hosts, and platform settings."
                : "Full permissions to manage store inventory, prices, and customer purchase orders."}
            </span>
          </div>
        </div>

        {/* Logout Section */}
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

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          {saveError && (
            <div className="p-3 rounded-xl bg-danger/10 text-danger text-xs font-semibold border border-danger/20">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <Input
            label="Full Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="e.g. admin@rafeeq.sy"
            required
          />

          <div>
            <Input
              label="Contact Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="09XXXXXXXX (10 digits)"
              maxLength={10}
              required
            />
            <p className="text-[11px] text-muted mt-1">
              Syrian mobile phone number (10 digits starting with 09)
            </p>
          </div>

          <div>
            <Input
              label="New Password (Optional)"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              minLength={8}
            />
            <p className="text-[11px] text-muted mt-1">
              Minimum 8 characters. Leave empty if you do not wish to change your password.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* FR-09 Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}
