"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  User,
  Heart,
  LogOut,
  LayoutDashboard,
  Store as StoreIcon,
  Stethoscope,
  Users,
  HeartHandshake,
} from "lucide-react";
import { RafeeqLogo } from "@/components/shared/RafeeqLogo";
import { LogoutModal } from "@/components/shared/LogoutModal";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, store, isAdmin, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const storeNavItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "My products", href: "/dashboard/products", icon: ShoppingBag },
    { label: "Purchase orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const adminNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Stores", href: "/dashboard/admin/stores", icon: StoreIcon },
    { label: "Doctors", href: "/dashboard/admin/doctors", icon: Stethoscope },
    { label: "Host Caregivers", href: "/dashboard/admin/hosts", icon: Users },
    { label: "Pet Owners", href: "/dashboard/admin/pet-owners", icon: HeartHandshake },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const navItems = isAdmin ? adminNavItems : storeNavItems;

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push("/login");
  };

  return (
    <>
      <aside
        className={`w-64 bg-navy text-white flex flex-col justify-between shrink-0 min-h-screen p-5 select-none transition-all duration-200 ${className}`}
      >
        {/* Top Section */}
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/dashboard" className="block px-2 pt-2 text-yellow hover:opacity-90 transition-opacity">
            <RafeeqLogo iconSize={36} textColor="text-white" />
          </Link>

          {/* Section Heading */}
          <div className="px-2">
            <p className="text-[11px] font-bold tracking-wider text-border-blue/80 uppercase">
              {isAdmin ? "Admin Workspace" : "Store Workspace"}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-yellow text-slate-900 shadow-sm"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Care Reminder Card (From Figma) */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-white/90 space-y-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-yellow">
              <Heart className="w-4 h-4 fill-yellow text-yellow" />
            </div>
            <p className="text-xs font-bold text-white">Good care starts here.</p>
            <p className="text-[11px] text-white/75 leading-relaxed">
              Small shop. Big love. Thanks for caring for your local pet community.
            </p>
          </div>
        </div>

        {/* Bottom Section: Store/Admin info & Logout */}
        <div className="pt-6 border-t border-white/15 space-y-3">
          <div className="px-1">
            <p className="text-xs font-bold text-white truncate">
              {isAdmin ? "Rafeeq Central Admin" : (store?.name || "Happy Paws Pet Store")}
            </p>
            <p className="text-[11px] text-white/70 truncate">
              {user?.name || "Maya Al Ali"} · {isAdmin ? "System Admin" : "Store owner"}
            </p>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white/90 bg-white/10 hover:bg-white/15 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-yellow" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* FR-09 Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
