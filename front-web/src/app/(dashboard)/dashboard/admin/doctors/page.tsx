"use client";

import { useEffect, useState } from "react";
import { Stethoscope, Plus, Search, Star, Power, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { adminService, AdminDoctor } from "@/services/admin.service";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<AdminDoctor[]>([
    {
      _id: "doc_001",
      externalDoctorId: "ext_doc_01",
      name: "Dr. Zaid Khouri",
      phone: "0933112244",
      address: "Shaalan, Damascus",
      status: "available",
      avgRating: 4.8,
      ratingsCount: 31,
    },
    {
      _id: "doc_002",
      externalDoctorId: "ext_doc_02",
      name: "Dr. Nour Salem",
      phone: "0944887766",
      address: "Mezzeh Autostrad, Damascus",
      status: "available",
      avgRating: 4.6,
      ratingsCount: 23,
    },
  ]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getDoctors().then(setDoctors);
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
      const created = await adminService.createDoctor({ name: name.trim(), phone: cleanPhone, address: address.trim() });
      setDoctors((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setName("");
      setPhone("");
      setAddress("");
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create doctor.");
    }
  };

  const handleToggle = async (id: string, currentStatus?: string) => {
    await adminService.toggleDoctorStatus(id, currentStatus);
    setDoctors((prev) =>
      prev.map((d) =>
        d._id === id || d.externalDoctorId === id
          ? { ...d, status: d.status === "available" ? "unavailable" : "available" }
          : d
      )
    );
  };

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Doctors Management
          </h1>
          <p className="text-sm text-muted">
            Manage certified veterinarians, synchronized live via VetExternalAdapter.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </Button>
      </div>

      <div className="bg-card border border-card-border p-3.5 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-muted ml-2" />
        <input
          type="text"
          placeholder="Search doctors by name or clinic location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted/60"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((doc, idx) => (
          <div
            key={`doctor-${doc._id || doc.externalDoctorId || idx}`}
            className="group bg-card border border-card-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue/50 transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue/20 text-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{doc.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{doc.avgRating} ({doc.ratingsCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-xs ${
                    doc.status === "available"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 border border-emerald-600"
                      : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {doc.status === "available" ? "Active" : "Unavailable"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-yellow shrink-0" />
                  <span>{doc.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue shrink-0" />
                  <span>{doc.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-card-border flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted font-mono">
                ExtID: {doc.externalDoctorId}
              </span>
              <Button
                variant={doc.status === "available" ? "secondary" : "primary"}
                size="sm"
                onClick={() => handleToggle(doc._id || doc.externalDoctorId, doc.status)}
                className="gap-1.5 text-xs"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{doc.status === "available" ? "Deactivate" : "Activate"}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Veterinarian">
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          {error && <div className="p-3 rounded-xl bg-danger/10 text-danger text-xs">{error}</div>}
          <Input label="Doctor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Example Name" />
          <div>
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="09XXXXXXXX (10 digits)" maxLength={10} />
            <p className="text-[11px] text-muted mt-1">
              رقم الموبايل السوري (10 أرقام تبدأ بـ 09، مثال: 0962202918)
            </p>
          </div>
          <Input label="Clinic Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Damascus, Shaalan" />
          <div className="flex justify-end gap-3 pt-3 border-t border-card-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add & Sync</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
