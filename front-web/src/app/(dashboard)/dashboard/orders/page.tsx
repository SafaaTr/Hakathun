"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ShoppingCart, Check, X, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { orderService } from "@/services/order.service";
import { Order, OrderStatus } from "@/types/order";
import { initialOrders } from "@/services/mockData";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    await orderService.updateOrderStatus(id, status);
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status } : o))
    );
    if (selectedOrder && selectedOrder._id === id) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      filterStatus === "all" ? true : o.status === filterStatus;
    const matchesSearch =
      o.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Purchase Orders
        </h1>
        <p className="text-sm text-muted">
          Review, approve, or reject customer orders and delivery requests.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-card-border p-3.5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code (e.g. RF-2048), customer, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-input-border bg-input-bg text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-yellow/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-muted mr-1 hidden sm:block" />
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "all"
                ? "bg-navy text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "pending"
                ? "bg-amber-500 text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            Pending ({orders.filter((o) => o.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "approved"
                ? "bg-emerald-600 text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            Approved ({orders.filter((o) => o.status === "approved").length})
          </button>
          <button
            onClick={() => setFilterStatus("rejected")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              filterStatus === "rejected"
                ? "bg-rose-600 text-white"
                : "text-muted hover:text-foreground hover:bg-cream/40"
            }`}
          >
            Rejected ({orders.filter((o) => o.status === "rejected").length})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-card-border rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 bg-cream/30 dark:bg-card-border/30 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-base font-semibold text-foreground">
              No orders found.
            </p>
            <p className="text-xs text-muted">
              Orders placed by pet owners will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border bg-cream/40 dark:bg-card-border/20 text-xs font-bold text-muted uppercase tracking-wider">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6">Total (SYP)</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-sm">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-cream/30 dark:hover:bg-card-border/20 transition-all duration-150"
                  >
                    {/* Reference Code */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cream dark:bg-card-border flex items-center justify-center text-navy dark:text-yellow shrink-0">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-navy dark:text-yellow">
                          {order.referenceCode}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-foreground">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted truncate max-w-48">
                        {order.deliveryAddress}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-6 font-medium text-foreground">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </td>

                    {/* Total Price */}
                    <td className="py-4 px-6 font-extrabold text-foreground">
                      {order.totalPrice.toLocaleString()} SYP
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-6">
                      <span className="inline-block text-xs font-semibold text-muted bg-cream/60 dark:bg-card-border/40 px-2.5 py-1 rounded-md">
                        Cash on Delivery
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <Badge status={order.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(order._id, "approved")}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                              title="Approve Order"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order._id, "rejected")}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                              title="Reject Order"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Order Inspection */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onApprove={(id) => handleStatusUpdate(id, "approved")}
        onReject={(id) => handleStatusUpdate(id, "rejected")}
      />
    </div>
  );
}
