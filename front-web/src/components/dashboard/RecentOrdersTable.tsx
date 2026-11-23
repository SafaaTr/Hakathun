"use client";

import { useState } from "react";
import Link from "next/link";
import { Order } from "@/types/order";
import { Badge } from "@/components/ui/Badge";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";

interface RecentOrdersTableProps {
  orders: Order[];
  onApproveOrder?: (id: string) => void;
  onRejectOrder?: (id: string) => void;
}

export function RecentOrdersTable({
  orders,
  onApproveOrder,
  onRejectOrder,
}: RecentOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Take the most recent pending or latest orders
  const displayOrders = orders.slice(0, 5);

  return (
    <>
      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xs space-y-5">
        {/* Table Heading */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Orders needing a little attention
          </h3>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-navy dark:text-yellow hover:underline"
          >
            <span>View all orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Rows */}
        <div className="divide-y divide-card-border">
          {displayOrders.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center">
              No recent orders found.
            </p>
          ) : (
            displayOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between py-4 hover:bg-cream/20 transition-colors rounded-xl px-3"
              >
                {/* Order Ref & Icon */}
                <div className="flex items-center gap-3.5 min-w-36">
                  <div className="w-8 h-8 rounded-full bg-cream dark:bg-card-border flex items-center justify-center text-navy dark:text-yellow shrink-0">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-navy dark:text-yellow">
                    {order.referenceCode}
                  </span>
                </div>

                {/* Customer Name */}
                <div className="text-sm font-semibold text-foreground/90 min-w-36 truncate">
                  {order.customerName}
                </div>

                {/* Price in SYP */}
                <div className="text-sm font-extrabold text-foreground min-w-32">
                  {order.totalPrice.toLocaleString()} SYP
                </div>

                {/* Status Badge */}
                <div className="min-w-24">
                  <Badge status={order.status} />
                </div>

                {/* Action button */}
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-navy dark:hover:text-yellow transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span>Review order</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onApprove={onApproveOrder}
        onReject={onRejectOrder}
      />
    </>
  );
}
