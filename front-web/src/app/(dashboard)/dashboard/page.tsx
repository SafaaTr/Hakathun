"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Clock, Coins } from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/order.service";
import { productService } from "@/services/product.service";
import { Order } from "@/types/order";
import { StoreStats } from "@/types/store";
import { initialStoreStats, initialOrders } from "@/services/mockData";

export default function DashboardHomePage() {
  const { user, store } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [stats, setStats] = useState<StoreStats>(initialStoreStats);

  useEffect(() => {
    async function loadData() {
      try {
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
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    loadData();
  }, []);

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
      {/* Page Heading (From Figma: Welcome back, Maya) */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Maya"}
        </h1>
        <p className="text-sm text-muted">
          Here’s what’s happening at {store?.name || "Happy Paws"} today.
        </p>
      </div>

      {/* Hero Welcome Banner */}
      <WelcomeBanner
        storeName={store?.name || "Happy Paws Pet Store"}
        location={store?.address || "Al-Mazzeh, Damascus"}
      />

      {/* Overview Statistics (3 Cards from Figma) */}
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

      {/* Recent Orders Section */}
      <RecentOrdersTable
        orders={orders}
        onApproveOrder={handleApproveOrder}
        onRejectOrder={handleRejectOrder}
      />
    </div>
  );
}
