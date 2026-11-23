export interface Store {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  status: 'active' | 'closed';
  ownerName?: string;
}

export interface StoreStats {
  availableProducts: number;
  unavailableProducts: number;
  pendingOrders: number;
  salesToday: number;
}
