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
  userId: string;
  name: string;
  phone: string;
  placeType: "home" | "barn";
  address: string;
  pricingType: "free" | "paid";
  dailyPrice: number | null;
  foodCost: string;
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
      const res = await api.get<ApiResponse<AdminStore[]>>("/admin/stores");
      if (res.data?.data) return res.data.data;
    } catch {}
    return mockStores;
  },

  async createStore(data: { name: string; phone: string; address: string }): Promise<AdminStore> {
    const newStore: AdminStore = {
      _id: `store_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      address: data.address,
      status: "active",
      productsCount: 0,
    };
    mockStores = [newStore, ...mockStores];
    return newStore;
  },

  async toggleStoreStatus(id: string): Promise<AdminStore> {
    mockStores = mockStores.map((s) =>
      s._id === id ? { ...s, status: s.status === "active" ? "closed" : "active" } : s
    );
    return mockStores.find((s) => s._id === id)!;
  },

  // Doctors
  async getDoctors(): Promise<AdminDoctor[]> {
    try {
      const res = await api.get<ApiResponse<AdminDoctor[]>>("/admin/doctors");
      if (res.data?.data) return res.data.data;
    } catch {}
    return mockDoctors;
  },

  async createDoctor(data: { name: string; phone: string; address: string }): Promise<AdminDoctor> {
    const newDoc: AdminDoctor = {
      _id: `doc_${Date.now()}`,
      externalDoctorId: `ext_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      address: data.address,
      status: "available",
      avgRating: 5.0,
      ratingsCount: 0,
    };
    mockDoctors = [newDoc, ...mockDoctors];
    return newDoc;
  },

  async toggleDoctorStatus(id: string): Promise<AdminDoctor> {
    mockDoctors = mockDoctors.map((d) =>
      d._id === id
        ? { ...d, status: d.status === "available" ? "unavailable" : "available" }
        : d
    );
    return mockDoctors.find((d) => d._id === id)!;
  },

  // Hosts
  async getHosts(): Promise<AdminHostCaregiver[]> {
    try {
      const res = await api.get<ApiResponse<AdminHostCaregiver[]>>("/admin/hosts");
      if (res.data?.data) return res.data.data;
    } catch {}
    return mockHosts;
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
