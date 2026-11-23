"use client";

import { useEffect, useState } from "react";
import { Search, Star, Home, MapPin, Phone, Coins, Plus, Power } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { adminService, AdminHostCaregiver } from "@/services/admin.service";

export default function AdminHostsPage() {
  const [hosts, setHosts] = useState<AdminHostCaregiver[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [placeType, setPlaceType] = useState<"home" | "barn">("home");
  const [acceptedPetType, setAcceptedPetType] = useState("Cats, Small Dogs");
  const [pricingType, setPricingType] = useState<"free" | "paid">("free");
  const [dailyPrice, setDailyPrice] = useState<number | undefined>(undefined);
  const [foodCost, setFoodCost] = useState("Provided by owner");
  const [error, setError] = useState<string | null>(null);

  const loadHosts = async () => {
    const list = await adminService.getHosts();
    setHosts(list);
  };

  useEffect(() => {
    loadHosts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة (Please fill in all fields).");
      return;
    }
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setError("رقم الهاتف غير صالح. يجب أن يبدأ بـ 09 ويتألف من 10 أرقام بالضبط (مثال: 0962202918).");
      return;
    }
    if (password && password.length < 8) {
      setError("كلمة المرور يجب أن لا تقل عن 8 محارف (Password must be at least 8 characters).");
      return;
    }
    try {
      const created = await adminService.createHost({
        name: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        placeType,
        acceptedPetType,
        pricingType,
        dailyPrice: pricingType === "paid" ? dailyPrice : null,
        foodCost,
        password: password.trim() || undefined,
      });
      setHosts((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setName("");
      setPhone("");
      setPassword("");
      setAddress("");
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create host.");
    }
  };

  const handleToggle = async (id: string, currentStatus?: string) => {
    await adminService.toggleHostStatus(id, currentStatus);
    setHosts((prev) =>
      prev.map((h) =>
        h._id === id || h.userId === id || h.hostUserId === id
          ? { ...h, status: (h.status || "available") === "available" ? "unavailable" : "available" }
          : h
      )
    );
  };

  const filtered = hosts.filter((h) =>
    (h.name || h.hostName || "").toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Host Caregivers (المربين المستضيفين)
          </h1>
          <p className="text-sm text-muted">
            Verified pet hosts offering temporary boarding during travels.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Add Host</span>
        </Button>
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
        {filtered.map((host) => {
          const isAvailable = (host.status || "available") === "available";
          const hostId = host._id || host.userId || host.hostUserId || "";

          return (
            <div
              key={hostId}
              className={`bg-card border border-card-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                !isAvailable ? "opacity-60 bg-muted/5 border-dashed" : ""
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{host.name || host.hostName}</h3>
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
                <button
                  onClick={() => handleToggle(hostId, host.status)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                    isAvailable
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isAvailable ? "Available" : "Unavailable"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Host Caregiver">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <Input
            label="Caregiver Full Name"
            placeholder="e.g. Lina Haddad"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <Input
              label="Phone Number"
              placeholder="09XXXXXXXX (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              maxLength={10}
              required
            />
            <p className="text-[11px] text-muted mt-1">
              رقم الموبايل السوري (10 أرقام تبدأ بـ 09، مثال: 0962202918)
            </p>
          </div>

          <div>
            <Input
              label="Caregiver Account Password (Optional)"
              type="password"
              placeholder="Defaults to Password123 if blank"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
            <p className="text-[11px] text-muted mt-1">
              كلمة مرور حساب المربّي (اختياري، الافتراضي: Password123، 8 محارف على الأقل)
            </p>
          </div>

          <Input
            label="Full Address / Location"
            placeholder="e.g. Dummar Project, Island 2, Damascus"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Place Type</label>
              <select
                value={placeType}
                onChange={(e) => setPlaceType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow"
              >
                <option value="home">Home (منزل)</option>
                <option value="barn">Barn / Farm (حظيرة / مزرعة)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Pricing Type</label>
              <select
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow"
              >
                <option value="free">Free (مجاني)</option>
                <option value="paid">Paid (مدفوع)</option>
              </select>
            </div>
          </div>

          {pricingType === "paid" && (
            <Input
              label="Daily Price (SYP)"
              type="number"
              placeholder="e.g. 25000"
              value={dailyPrice || ""}
              onChange={(e) => setDailyPrice(Number(e.target.value))}
              required
            />
          )}

          <Input
            label="Accepted Pet Types"
            placeholder="e.g. Cats, Small Dogs"
            value={acceptedPetType}
            onChange={(e) => setAcceptedPetType(e.target.value)}
          />

          <Input
            label="Food Arrangement / Notes"
            placeholder="e.g. Provided by owner or 10,000 SYP/day"
            value={foodCost}
            onChange={(e) => setFoodCost(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button variant="secondary" size="md" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Register Host
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
