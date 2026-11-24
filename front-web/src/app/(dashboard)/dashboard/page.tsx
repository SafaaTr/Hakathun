"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Clock, Coins, Store, Stethoscope, Users, HeartHandshake } from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { AnimatedCatMascot } from "@/components/dashboard/AnimatedCatMascot";
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
            value={stats.salesToday.toLocaleString()}
            subValue="SYP · Cash on Delivery"
            icon={<Coins className="w-5 h-5 text-yellow" />}
          />
        </div>
      )}

      {/* For Admin: Interactive Anime.js Animated Cat Mascot (Rafeeq) */}
      {isAdmin ? (
        <AnimatedCatMascot />
      ) : (
        /* Recent Orders Section for Store Owner */
        <RecentOrdersTable
          orders={orders}
          onApproveOrder={handleApproveOrder}
          onRejectOrder={handleRejectOrder}
        />
      )}
    </div>
  );
}
