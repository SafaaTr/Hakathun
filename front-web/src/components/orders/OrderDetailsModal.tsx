import { Order } from "@/types/order";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { User, Phone, MapPin, CreditCard, ShoppingBag } from "lucide-react";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details: ${order.referenceCode}`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-4 bg-cream/60 dark:bg-card-border/30 rounded-2xl border border-card-border">
          <div>
            <p className="text-xs text-muted font-medium">Order Reference</p>
            <p className="text-lg font-bold text-navy dark:text-yellow">
              {order.referenceCode}
            </p>
          </div>
          <Badge status={order.status} />
        </div>

        {/* Customer & Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-card-border space-y-2">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">
              Customer Information
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="w-4 h-4 text-blue shrink-0" />
              <span>{order.customerName}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{order.customerPhone}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-card-border space-y-2">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">
              Delivery Address
            </p>
            <div className="flex items-start gap-2 text-xs text-foreground font-medium">
              <MapPin className="w-4 h-4 text-yellow shrink-0 mt-0.5" />
              <span>{order.deliveryAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Delivery on Cash (COD)</span>
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wider">
            Items in Cart ({order.items.length})
          </p>
          <div className="divide-y divide-card-border border border-card-border rounded-xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 text-xs bg-card hover:bg-cream/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cream dark:bg-card-border flex items-center justify-center text-navy dark:text-yellow">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-muted">
                      Qty: {item.quantity} × {(Number(item.unitPrice) || 0).toLocaleString()} SYP
                    </p>
                  </div>
                </div>
                <span className="font-bold text-foreground">
                  {(Number(item.unitPrice || 0) * Number(item.quantity || 1)).toLocaleString()} SYP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between p-4 bg-yellow/10 border border-yellow/30 rounded-xl">
          <span className="text-sm font-bold text-foreground">
            Total Price
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-yellow">
            {(Number(order.totalPrice) || 0).toLocaleString()} SYP
          </span>
        </div>

        {/* Actions for Pending orders */}
        {order.status === "pending" && (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-card-border">
            {onReject && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  onReject(order._id);
                  onClose();
                }}
                className="text-danger hover:bg-danger/10 border-danger/30"
              >
                Reject Order
              </Button>
            )}
            {onApprove && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onApprove(order._id);
                  onClose();
                }}
                className="font-bold"
              >
                Approve Order
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
