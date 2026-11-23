import { api } from "./api";
import { ApiResponse } from "@/types/api";

export interface AdminStore {
  _id: string;
  name: string;
  phone: string;
  address: string;
  status: "active" | "closed";
  productsCount?: number;
}

export interface AdminDoctor {
  _id: string;
  externalDoctorId: string;
  name: string;
  phone: string;
  address: string;
  status: "available" | "unavailable";
  avgRating: number;
  ratingsCount: number;
}

export interface AdminHostCaregiver {
  _id: string;
  userId?: string;
  hostUserId?: string;
  name: string;
  hostName?: string;
  phone: string;
  placeType: "home" | "barn";
  address: string;
  acceptedPetType?: string;
  pricingType: "free" | "paid";
  dailyPrice: number | null;
  foodCost: string;
  status?: "available" | "unavailable";
  avgRating: number;
  ratingsCount: number;
}

export interface AdminPetOwner {
  _id: string;
  name: string;
  phone: string;
  petsCount: number;
  hasPet: boolean;
  canHost: boolean;
  isActive: boolean;
}

let mockStores: AdminStore[] = [
  {
    _id: "store_001",
    name: "Happy Paws Pet Store",
    phone: "0988776655",
    address: "Al-Mazzeh, Damascus",
    status: "active",
    productsCount: 24,
  },
  {
    _id: "store_002",
    name: "Pet Paradise Damascus",
    phone: "0944112233",
    address: "Abu Roummaneh, Damascus",
    status: "active",
    productsCount: 18,
  },
  {
    _id: "store_003",
    name: "Royal Canine Care Center",
    phone: "0955998877",
    address: "Malki, Damascus",
    status: "closed",
    productsCount: 9,
  },
];

let mockDoctors: AdminDoctor[] = [
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
  {
    _id: "doc_003",
    externalDoctorId: "ext_doc_03",
    name: "Dr. Fadi Bitar",
    phone: "0955663322",
    address: "Kafar Souseh, Damascus",
    status: "unavailable",
    avgRating: 4.2,
    ratingsCount: 14,
  },
];

const mockHosts: AdminHostCaregiver[] = [
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
  {
    _id: "host_002",
    userId: "usr_h2",
    name: "Tarek Mansour",
    phone: "0966442211",
    placeType: "barn",
    address: "Al-Sabboura Rural Retreat",
    pricingType: "free",
    dailyPrice: null,
    foodCost: "15,000 SYP",
    avgRating: 4.7,
    ratingsCount: 12,
  },
];

const mockOwners: AdminPetOwner[] = [
  {
    _id: "usr_o1",
    name: "Maya Al Ali",
    phone: "0988776655",
    petsCount: 2,
    hasPet: true,
    canHost: false,
    isActive: true,
  },
  {
    _id: "usr_o2",
    name: "Rami Mansour",
    phone: "0933112233",
    petsCount: 1,
    hasPet: true,
    canHost: true,
    isActive: true,
  },
  {
    _id: "usr_o3",
    name: "Sara Hamwi",
    phone: "0944223344",
    petsCount: 3,
    hasPet: true,
    canHost: false,
    isActive: true,
  },
];

export const adminService = {
  // Stores
  async getStores(): Promise<AdminStore[]> {
    try {
      const res = await api.get<ApiResponse<any>>("/admin/stores");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        return list.map((s: any) => ({
          _id: s._id || s.id,
          name: s.name,
          phone: s.phone,
          address: s.address,
          status: s.status || "active",
          productsCount: s.productsCount || 0,
        }));
      }
    } catch {}
    return mockStores;
  },

  async createStore(data: { name: string; phone: string; address: string }): Promise<AdminStore> {
    try {
      const res = await api.post<ApiResponse<any>>("/admin/stores", {
        name: data.name,
        phone: data.phone,
        address: data.address,
      });
      const s = res.data?.data || res.data;
      return {
        _id: s._id || s.id,
        name: s.name,
        phone: s.phone,
        address: s.address,
        status: s.status || "active",
        productsCount: 0,
      };
    } catch (err: any) {
      console.error("Failed to create store on backend:", err?.response?.data || err?.message);
      throw err;
    }
  },

  async toggleStoreStatus(id: string, currentStatus?: string): Promise<AdminStore> {
    const nextStatus = currentStatus === "active" ? "closed" : "active";
    try {
      await api.patch(`/admin/stores/${id}`, { status: nextStatus });
    } catch {}
    mockStores = mockStores.map((s) =>
      s._id === id ? { ...s, status: nextStatus } : s
    );
    return {
      _id: id,
      name: "",
      phone: "",
      address: "",
      status: nextStatus,
      productsCount: 0,
    };
  },

  // Doctors
  async getDoctors(): Promise<AdminDoctor[]> {
    try {
      const res = await api.get<ApiResponse<any>>("/admin/doctors");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        return list.map((d: any) => ({
          _id: d._id || d.id || d.doctorId,
          externalDoctorId: d.doctorId || d.id || d._id,
          name: d.name,
          phone: d.phone,
          address: d.address,
          status: d.status || "available",
          avgRating: d.avgRating ?? 5.0,
          ratingsCount: d.ratingsCount ?? 0,
        }));
      }
    } catch {}
    return mockDoctors;
  },

  async createDoctor(data: { name: string; phone: string; address: string }): Promise<AdminDoctor> {
    try {
      const res = await api.post<ApiResponse<any>>("/admin/doctors", {
        name: data.name,
        phone: data.phone,
        address: data.address,
        password: "Password123",
        confirmPassword: "Password123",
      });
      const d = res.data?.data || res.data;
      return {
        _id: d.id || d._id || d.doctorId,
        externalDoctorId: d.doctorId || d.id,
        name: d.name,
        phone: d.phone,
        address: d.address,
        status: d.status || "available",
        avgRating: 5.0,
        ratingsCount: 0,
      };
    } catch (err: any) {
      console.error("Failed to create doctor on backend:", err?.response?.data || err?.message);
      throw err;
    }
  },

  async toggleDoctorStatus(id: string, currentStatus?: string): Promise<AdminDoctor> {
    const nextStatus = currentStatus === "available" ? "unavailable" : "available";
    try {
      await api.patch(`/admin/doctors/${id}`, { status: nextStatus });
    } catch {}
    mockDoctors = mockDoctors.map((d) =>
      d._id === id || d.externalDoctorId === id
        ? { ...d, status: nextStatus }
        : d
    );
    return {
      _id: id,
      externalDoctorId: id,
      name: "",
      phone: "",
      address: "",
      status: nextStatus,
      avgRating: 5.0,
      ratingsCount: 0,
    };
  },

  // Hosts
  async getHosts(): Promise<AdminHostCaregiver[]> {
    try {
      const res = await api.get<ApiResponse<any>>("/admin/hosts");
      const list = res.data?.data || res.data;
      if (Array.isArray(list)) {
        return list.map((h: any) => ({
          _id: h._id || h.id,
          userId: h.hostUserId || h.userId || h._id,
          hostUserId: h.hostUserId || h.userId || h._id,
          name: h.name || h.hostName || "Caregiver",
          phone: h.phone || "",
          placeType: h.placeType || "home",
          address: h.address || "",
          acceptedPetType: h.acceptedPetType || "Cats, Dogs",
          pricingType: h.pricingType || "free",
          dailyPrice: h.dailyPrice ?? null,
          foodCost: h.foodCost || "Not needed",
          status: h.status || "available",
          avgRating: h.avgRating ?? 5.0,
          ratingsCount: h.ratingsCount ?? 0,
        }));
      }
    } catch {}
    return mockHosts;
  },

  async createHost(data: {
    name: string;
    phone: string;
    address: string;
    placeType: "home" | "barn";
    acceptedPetType?: string;
    pricingType: "free" | "paid";
    dailyPrice?: number | null;
    foodCost?: string;
  }): Promise<AdminHostCaregiver> {
    try {
      const res = await api.post<ApiResponse<any>>("/admin/hosts", {
        name: data.name,
        phone: data.phone,
        address: data.address,
        placeType: data.placeType,
        acceptedPetType: data.acceptedPetType || "Cats, Small Dogs",
        pricingType: data.pricingType,
        dailyPrice: data.pricingType === "paid" ? data.dailyPrice : null,
        foodCost: data.foodCost || "Not needed",
        password: "Password123",
        confirmPassword: "Password123",
      });
      const h = res.data?.data || res.data;
      return {
        _id: h.id || h._id,
        userId: h.hostUserId || h.userId || h._id,
        hostUserId: h.hostUserId || h.userId || h._id,
        name: h.name,
        phone: h.phone,
        placeType: h.placeType,
        address: h.address,
        pricingType: h.pricingType,
        dailyPrice: h.dailyPrice,
        foodCost: h.foodCost,
        status: h.status || "available",
        avgRating: 5.0,
        ratingsCount: 0,
      };
    } catch (err: any) {
      console.error("Failed to create host on backend:", err?.response?.data || err?.message);
      throw err;
    }
  },

  async toggleHostStatus(id: string, currentStatus?: string): Promise<void> {
    const nextStatus = currentStatus === "available" ? "unavailable" : "available";
    try {
      await api.patch(`/admin/hosts/${id}`, { status: nextStatus });
    } catch {}
  },

  // Pet Owners
  async getPetOwners(): Promise<AdminPetOwner[]> {
    try {
      const res = await api.get<ApiResponse<AdminPetOwner[]>>("/admin/pet-owners");
      if (res.data?.data) return res.data.data;
    } catch {}
    return mockOwners;
  },
};
