"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  Coins,
  Store,
  Stethoscope,
  Users,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import { adminService } from "@/services/admin.service";
import { Order } from "@/types/order";
import { StoreStats } from "@/types/store";
import { initialStoreStats, initialOrders } from "@/services/mockData";

export default function DashboardHomePage() {
  const { user, store, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [stats, setStats] = useState<StoreStats>(initialStoreStats);
  const [adminStats, setAdminStats] = useState<{
    storesCount: number;
    doctorsCount: number;
    hostsCount: number;
    usersCount: number;
  }>({
    storesCount: 3,
    doctorsCount: 5,
    hostsCount: 4,
    usersCount: 12,
  });

  useEffect(() => {
    async function loadData() {
      try {
        if (isAdmin) {
          const [storesList, doctorsList, hostsList, ownersList, adminOrders] = await Promise.all([
            adminService.getStores(),
            adminService.getDoctors(),
            adminService.getHosts(),
            adminService.getPetOwners(),
            adminService.getOrders(),
          ]);

          setAdminStats({
            storesCount: storesList.length || 3,
            doctorsCount: doctorsList.length || 5,
            hostsCount: hostsList.length || 4,
            usersCount: ownersList.length || 12,
          });

          if (adminOrders && adminOrders.length > 0) {
            setOrders(
              adminOrders.map((o: any, idx: number) => ({
                _id: o._id || o.id || `ord-${idx}`,
                referenceCode: o.referenceCode || `ORD-${100000 + idx}`,
                customerId: o.customerId?._id || o.customerId || `cust-${idx}`,
                customerName: o.customerId?.name || o.customerName || "Customer",
                customerPhone: o.customerId?.phone || o.customerPhone || "0911223344",
                storeId: o.storeId?._id || o.storeId || "store_001",
                totalPrice: o.totalPrice || 25000,
                status: o.status || "pending",
                items: o.items || [],
                createdAt: o.createdAt || new Date().toISOString(),
                deliveryAddress: o.deliveryAddress || "Damascus",
                paymentMethod: "cash_on_delivery" as const,
              }))
            );
          }
        } else {
          const [ordersData, productsData] = await Promise.all([
            orderService.getOrders(),
            productService.getProducts(),
          ]);

          setOrders(ordersData);

          const available = productsData.filter((p) => p.status === "available").length;
          const unavailable = productsData.filter((p) => p.status === "unavailable").length;
          const pending = ordersData.filter((o) => o.status === "pending").length;
          const sales = ordersData
            .filter((o) => o.status === "approved")
            .reduce((acc, curr) => acc + curr.totalPrice, initialStoreStats.salesToday);

          setStats({
            availableProducts: available || 21,
            unavailableProducts: unavailable || 3,
            pendingOrders: pending || 8,
            salesToday: sales || 895500,
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    loadData();
  }, [isAdmin]);

  const handleApproveOrder = async (id: string) => {
    await orderService.updateOrderStatus(id, "approved");
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: "approved" } : o))
    );
  };

  const handleRejectOrder = async (id: string) => {
    await orderService.updateOrderStatus(id, "rejected");
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: "rejected" } : o))
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Heading */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {isAdmin ? "Welcome back, System Administrator" : `Welcome back, ${user?.name?.split(" ")[0] || "Maya"}`}
        </h1>
        <p className="text-sm text-muted">
          {isAdmin
            ? "Here’s an overview of the Rafeeq platform activity today."
            : `Here’s what’s happening at ${store?.name || "Happy Paws"} today.`}
        </p>
      </div>

      {/* Hero Welcome Banner */}
      <WelcomeBanner
        storeName={store?.name || "Happy Paws Pet Store"}
        location={store?.address || "Al-Mazzeh, Damascus"}
        isAdmin={isAdmin}
      />

      {/* Overview Statistics */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            label="Active Stores"
            value={adminStats.storesCount}
            subValue="Registered Pet Stores"
            icon={<Store className="w-5 h-5 text-yellow" />}
          />
          <StatCard
            label="Veterinarians"
            value={adminStats.doctorsCount}
            subValue="Verified Vet Clinics"
            icon={<Stethoscope className="w-5 h-5 text-blue" />}
          />
          <StatCard
            label="Host Caregivers"
            value={adminStats.hostsCount}
            subValue="Home & Barn Hosts"
            icon={<Users className="w-5 h-5 text-emerald-500" />}
          />
          <StatCard
            label="Registered Pet Owners"
            value={adminStats.usersCount}
            subValue="Active App Users"
            icon={<HeartHandshake className="w-5 h-5 text-rose-500" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Available products"
            value={stats.availableProducts}
            subValue={`${stats.unavailableProducts} unavailable`}
            icon={<ShoppingBag className="w-5 h-5 text-blue" />}
          />
          <StatCard
            label="Pending orders"
            value={stats.pendingOrders}
            subValue="Needs your attention"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatCard
            label="Sales today"
            value={(stats?.salesToday ?? 0).toLocaleString()}
            subValue="SYP · Cash on Delivery"
            icon={<Coins className="w-5 h-5 text-yellow" />}
          />
        </div>
      )}

      {/* For Admin: Clean, Organized Platform Management Hub */}
      {isAdmin ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Platform Operations & Directory
              </h2>
              <p className="text-xs text-muted">
                Direct access to manage verified stakeholders, service providers, and app members.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream dark:bg-card-border/40 text-xs font-semibold text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full Admin Oversight</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Store Hub Card */}
            <Link
              href="/dashboard/admin/stores"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-yellow/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-yellow/20 text-navy dark:text-yellow flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {adminStats.storesCount} Stores
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-yellow transition-colors">
                  Stores Directory
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Provision store licenses, browse catalogues, and monitor operational status.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-navy dark:text-yellow group-hover:translate-x-1.5 transition-transform duration-200">
                <span>Manage Stores</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Doctors Hub Card */}
            <Link
              href="/dashboard/admin/doctors"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-blue/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue/20 text-blue flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue bg-blue/10 px-2.5 py-1 rounded-full border border-blue/20">
                  {adminStats.doctorsCount} Certified
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-blue transition-colors">
                  Veterinary Clinics
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Vet external adapters, doctor ratings, clinic addresses, and availability.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue group-hover:translate-x-1.5 transition-transform duration-200">
                <span>Manage Clinics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Hosts Hub Card */}
            <Link
              href="/dashboard/admin/hosts"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20">
                  {adminStats.hostsCount} Hosts
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-amber-600 transition-colors">
                  Host Caregivers
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Home and barn boarding hosts, daily pricing, capacity, and ratings.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-1.5 transition-transform duration-200">
                <span>Manage Hosts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Pet Owners Hub Card */}
            <Link
              href="/dashboard/admin/pet-owners"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg hover:border-rose-500/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/20">
                  {adminStats.usersCount} Owners
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-rose-500 transition-colors">
                  Pet Owners
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Platform users, registered companion pets, dual-role hosts, and activity.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-rose-500 group-hover:translate-x-1.5 transition-transform duration-200">
                <span>View Owners</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      ) : (
        /* Store Management Hub & Recent Orders Section for Store Owner */
        <div className="space-y-6">
          {/* Store Quick Navigation Cards with Admin-style animations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Products Hub Card */}
            <Link
              href="/dashboard/products"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-yellow/50 flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-yellow/20 text-navy dark:text-yellow flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-transform duration-200">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-navy dark:text-yellow bg-cream dark:bg-card-border/60 px-2.5 py-1 rounded-full border border-card-border shadow-2xs group-hover:scale-105 transition-transform duration-150">
                  {stats.availableProducts} Available
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-yellow transition-colors duration-150">
                  Product Inventory
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Add new items, update prices, adjust stock, and edit photos.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-navy dark:text-yellow group-hover:translate-x-2 transition-transform duration-200">
                <span>Manage Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Orders Hub Card */}
            <Link
              href="/dashboard/orders"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue/50 flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-blue/20 text-blue flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-transform duration-200">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20 shadow-2xs group-hover:scale-105 transition-transform duration-150">
                  {stats.pendingOrders} Pending
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-blue transition-colors duration-150">
                  Purchase Orders
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Review incoming requests, approve deliveries, and track orders.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue group-hover:translate-x-2 transition-transform duration-200">
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Profile Hub Card */}
            <Link
              href="/dashboard/profile"
              className="group bg-card border border-card-border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/50 flex flex-col justify-between space-y-4 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-2 transition-transform duration-200">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform duration-150">
                  Active Store
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 transition-colors duration-150">
                  Store Profile & Settings
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Edit store address, phone contact, and operational preferences.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-2 transition-transform duration-200">
                <span>Edit Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Recent Orders Section for Store Owner */}
          <RecentOrdersTable
            orders={orders}
            onApproveOrder={handleApproveOrder}
            onRejectOrder={handleRejectOrder}
          />
        </div>
      )}
    </div>
  );
}
