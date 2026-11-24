"use client";

import { useEffect, useState } from "react";
import { Store, Plus, Search, Power, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { adminService, AdminStore } from "@/services/admin.service";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getStores().then(setStores);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setError("رقم الهاتف غير صالح. يجب أن يبدأ بـ 09 ويتألف من 10 أرقام بالضبط (مثال: 0962202918).");
      return;
    }
    try {
      const created = await adminService.createStore({ name: name.trim(), phone: cleanPhone, address: address.trim() });
      setStores((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create store.");
    }
  };

  const handleToggle = async (id: string, currentStatus?: string) => {
    await adminService.toggleStoreStatus(id, currentStatus);
    setStores((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, status: s.status === "active" ? "closed" : "active" } : s
      )
    );
  };

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Stores Management
          </h1>
          <p className="text-sm text-muted">
            Admin oversight: Provision new store accounts, edit locations, or toggle operational status.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Provision Store</span>
        </Button>
      </div>

      <div className="bg-card border border-card-border p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-muted ml-2" />
        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted/60"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((store, idx) => (
          <div
            key={`store-${store._id || idx}`}
            className="group bg-card border border-card-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-1.5 hover:shadow-lg hover:border-yellow/50 transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow/20 text-navy dark:text-yellow flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{store.name}</h3>
                    <p className="text-xs text-muted">ID: {store._id}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-xs ${
                    store.status === "active"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 border border-emerald-600"
                      : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {store.status === "active" ? "Active" : "Closed"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-yellow shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue shrink-0" />
                  <span>{store.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-card-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">
                {store.productsCount || 0} products listed
              </span>
              <Button
                variant={store.status === "active" ? "secondary" : "primary"}
                size="sm"
                onClick={() => handleToggle(store._id, store.status)}
                className="gap-1.5 text-xs"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{store.status === "active" ? "Close Store" : "Reopen Store"}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New Store">
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-xs">{error}</div>}
          <Input label="Store Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pet Haven" />
          <div>
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXX (10 digits)" maxLength={10} />
            <p className="text-[11px] text-muted mt-1">
              رقم الموبايل السوري (10 أرقام تبدأ بـ 09، مثال: 0962202918)
            </p>
          </div>
          <Input label="Physical Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Damascus, Malki" />
          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Store</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
