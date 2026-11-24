import Link from "next/link";
import { ShoppingBag, Store, Stethoscope, Users } from "lucide-react";

interface WelcomeBannerProps {
  storeName?: string;
  location?: string;
  isAdmin?: boolean;
}

export function WelcomeBanner({
  storeName = "Happy Paws Pet Store",
  location = "Al-Mazzeh, Damascus",
  isAdmin = false,
}: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden bg-yellow rounded-3xl p-8 lg:p-10 shadow-sm border border-yellow-hover/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 select-none">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-soft-yellow/40 rounded-full blur-2xl pointer-events-none" />

      {/* Left content */}
      <div className="relative z-10 space-y-3 max-w-xl">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isAdmin ? "Rafeeq Central Administration" : "A good day to care for pets."}
        </h2>
        <p className="text-sm font-semibold text-slate-800/80">
          {isAdmin
            ? "Unified platform management · Stores, Veterinarians, Hosts & Owners"
            : `${storeName} · ${location}`}
        </p>

        <div className="pt-2 flex flex-wrap gap-2.5">
          {isAdmin ? (
            <>
              <Link
                href="/dashboard/admin/stores"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-navy" />
                <span>Manage Stores</span>
              </Link>
              <Link
                href="/dashboard/admin/doctors"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-navy" />
                <span>Manage Doctors</span>
              </Link>
              <Link
                href="/dashboard/admin/hosts"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-navy" />
                <span>Manage Hosts</span>
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-xs hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-navy" />
              <span>Manage products</span>
            </Link>
          )}
        </div>
      </div>

      {/* Right Decorative Paw Print SVG from Figma */}
      <div className="relative z-10 shrink-0 text-navy/85 hidden sm:block">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main paw pad outline */}
          <path
            d="M50 48C41.7 48 35 56.4 35 66.8C35 75 40.8 81.8 50 81.8C59.2 81.8 65 75 65 66.8C65 56.4 58.3 48 50 48Z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Toe 1 */}
          <circle cx="28.8" cy="36.8" r="8.8" stroke="currentColor" strokeWidth="6" />
          {/* Toe 2 */}
          <circle cx="41.2" cy="25.5" r="8.8" stroke="currentColor" strokeWidth="6" />
          {/* Toe 3 */}
          <circle cx="58.8" cy="25.5" r="8.8" stroke="currentColor" strokeWidth="6" />
          {/* Toe 4 */}
          <circle cx="71.2" cy="36.8" r="8.8" stroke="currentColor" strokeWidth="6" />
        </svg>
      </div>
    </div>
  );
}
