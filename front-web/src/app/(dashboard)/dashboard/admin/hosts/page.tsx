"use client";

import { useEffect, useState } from "react";
import { Search, Star, Home, MapPin, Phone, Coins } from "lucide-react";
import { adminService, AdminHostCaregiver } from "@/services/admin.service";

export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<AdminHostCaregiver[]>([
    {
      _id: "host_001",
      userId: "usr_h1",
      name: "Lina Haddad",
      phone: "0933556677",
      placeType: "home",
      address: "Dummar Project, Island 2",
      pricingType: "paid",
      dailyPrice: 35000,
      foodCost: "Not needed",
      avgRating: 4.9,
      ratingsCount: 18,
    },
  ]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminService.getHosts().then(setHosts);
  }, []);

  const filtered = hosts.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Host Caregivers (المربين المستضيفين)
        </h1>
        <p className="text-sm text-muted">
          Verified pet hosts offering temporary boarding during travels.
        </p>
      </div>

      <div className="bg-card border border-card-border p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-muted ml-2" />
        <input
          type="text"
          placeholder="Search caregivers by name or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted/60"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((host) => (
          <div
            key={host._id}
            className="bg-card border border-card-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{host.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{host.avgRating} ({host.ratingsCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cream border border-card-border text-navy uppercase">
                  {host.placeType}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-yellow shrink-0" />
                  <span>{host.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue shrink-0" />
                  <span>{host.phone}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Coins className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    Pricing: {host.pricingType === "paid" ? `${host.dailyPrice?.toLocaleString()} SYP / day` : "Free"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
              <span>Food: {host.foodCost}</span>
              <span className="font-bold text-navy dark:text-yellow">Verified Host</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
