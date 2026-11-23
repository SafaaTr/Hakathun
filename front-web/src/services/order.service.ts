import { api } from "./api";
import { Order, OrderStatus } from "@/types/order";
import { ApiResponse } from "@/types/api";
import { initialOrders } from "./mockData";

let localOrders: Order[] = [...initialOrders];

export const orderService = {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get<ApiResponse<Order[]>>("/store/orders");
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return localOrders;
    } catch {
      return localOrders;
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const response = await api.patch<ApiResponse<Order>>(`/store/orders/${id}/status`, { status });
      if (response.data?.data) {
        return response.data.data;
      }
    } catch {
      // Fallback locally
    }

    localOrders = localOrders.map((o) =>
      o._id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    const updated = localOrders.find((o) => o._id === id);
    if (!updated) throw new Error("Order not found");
    return updated;
  },
};
