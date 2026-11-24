"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, PawPrint } from "lucide-react";
import { adminService, AdminPetOwner } from "@/services/admin.service";

export default function AdminPetOwnersPage() {
  const [owners, setOwners] = useState<AdminPetOwner[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminService.getPetOwners().then(setOwners);
  }, []);

  const filtered = owners.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.phone.includes(search)
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Pet Owners
        </h1>
        <p className="text-sm text-muted">
          Registered pet owners, registered companions, and app usage details.
        </p>
      </div>

      <div className="bg-card border border-card-border p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-muted ml-2" />
        <input
          type="text"
          placeholder="Search pet owners by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted/60"
        />
      </div>

      <div className="bg-card border border-card-border rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-card-border bg-cream/40 dark:bg-card-border/20 text-xs font-bold text-muted uppercase tracking-wider">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Registered Pets</th>
              <th className="py-4 px-6">Can Host?</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border text-sm">
            {filtered.map((owner, idx) => {
              const ownerKey = `owner-${owner._id || "id"}-${owner.phone || "ph"}-${idx}`;
              return (
                <tr
                  key={ownerKey}
                  className="hover:bg-cream/30 dark:hover:bg-card-border/30 transition-all duration-150"
                >
                  <td className="py-4 px-6 font-bold text-foreground flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cream dark:bg-card-border flex items-center justify-center text-navy dark:text-yellow">
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <span>{owner.name}</span>
                  </td>
                  <td className="py-4 px-6 text-muted font-mono">{owner.phone}</td>
                  <td className="py-4 px-6 font-semibold text-foreground">
                    {owner.petsCount} pet{owner.petsCount > 1 ? "s" : ""}
                  </td>
                  <td className="py-4 px-6">
                    {owner.canHost ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Dual Role (Host)
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Pet Owner Only</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
