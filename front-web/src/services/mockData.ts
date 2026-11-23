import { Store, StoreStats } from "@/types/store";
import { Product } from "@/types/product";
import { Order } from "@/types/order";
import { User } from "@/types/auth";

export const initialStore: Store = {
  _id: "store_001",
  userId: "user_owner_001",
  name: "Happy Paws Pet Store",
  phone: "0988776655",
  address: "Al-Mazzeh, Damascus",
  status: "active",
  ownerName: "Maya Al Ali",
};

export const initialOwnerUser: User = {
  _id: "user_owner_001",
  name: "Maya Al Ali",
  phone: "0988776655",
  roles: ["store_owner"],
  isActive: true,
};

export const initialAdminUser: User = {
  _id: "user_admin_001",
  name: "Rafeeq Admin",
  phone: "0911223344",
  roles: ["admin"],
  isActive: true,
};

export const initialStoreStats: StoreStats = {
  availableProducts: 21,
  unavailableProducts: 3,
  pendingOrders: 8,
  salesToday: 895500, // SYP
};

export const initialProducts: Product[] = [
  {
    _id: "prod_001",
    storeId: "store_001",
    name: "Royal Canin Mini Adult (3kg)",
    details: "Premium balanced nutrition for adult dogs weighing up to 10kg.",
    price: 150000,
    imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
  {
    _id: "prod_002",
    storeId: "store_001",
    name: "Purina Pro Plan Cat Salmon",
    details: "High-protein dry cat food rich in natural omega fatty acids for sensitive skin.",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
  {
    _id: "prod_003",
    storeId: "store_001",
    name: "Ergonomic Reflective Dog Harness",
    details: "Breathable padded vest harness with front clip and high-visibility stitching.",
    price: 65000,
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
  {
    _id: "prod_004",
    storeId: "store_001",
    name: "Stainless Steel Anti-Slip Pet Bowl",
    details: "Durable stainless steel food and water bowl with rubber non-slip ring base.",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
  {
    _id: "prod_005",
    storeId: "store_001",
    name: "Multi-Level Cat Scratching Tree",
    details: "Natural sisal post with cozy plush perches and dangling play balls.",
    price: 210000,
    imageUrl: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
  {
    _id: "prod_006",
    storeId: "store_001",
    name: "Organic Oatmeal Pet Shampoo (500ml)",
    details: "Hypoallergenic soothing formula formulated for itchy or dry sensitive skin.",
    price: 42000,
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80",
    status: "unavailable",
  },
  {
    _id: "prod_007",
    storeId: "store_001",
    name: "Dental Care Chews for Dogs (Pack of 12)",
    details: "Vet-recommended dental chews that reduce tartar and freshen breath.",
    price: 25000,
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
  {
    _id: "prod_008",
    storeId: "store_001",
    name: "Portable Airline-Approved Travel Carrier",
    details: "Breathable mesh pet transport bag with fleece bed and shoulder strap.",
    price: 185000,
    imageUrl: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&auto=format&fit=crop&q=80",
    status: "available",
  },
];

export const initialOrders: Order[] = [
  {
    _id: "ord_001",
    referenceCode: "RF-2048",
    customerId: "cust_001",
    customerName: "Rami Mansour",
    customerPhone: "0933112233",
    storeId: "store_001",
    items: [
      { productId: "prod_003", productName: "Ergonomic Reflective Dog Harness", unitPrice: 65000, quantity: 1 },
      { productId: "prod_006", productName: "Organic Oatmeal Pet Shampoo (500ml)", unitPrice: 42000, quantity: 1 },
    ],
    totalPrice: 107000,
    deliveryAddress: "Damascus, Malki, Building 14, 2nd Floor",
    paymentMethod: "cash_on_delivery",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "ord_002",
    referenceCode: "RF-2047",
    customerId: "cust_002",
    customerName: "Sara Hamwi",
    customerPhone: "0944223344",
    storeId: "store_001",
    items: [
      { productId: "prod_003", productName: "Ergonomic Reflective Dog Harness", unitPrice: 65000, quantity: 1 },
    ],
    totalPrice: 65000,
    deliveryAddress: "Damascus, Abu Roummaneh, Main Street",
    paymentMethod: "cash_on_delivery",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "ord_003",
    referenceCode: "RF-2046",
    customerId: "cust_003",
    customerName: "Omar Darwish",
    customerPhone: "0955334455",
    storeId: "store_001",
    items: [
      { productId: "prod_004", productName: "Stainless Steel Anti-Slip Pet Bowl", unitPrice: 35000, quantity: 1 },
      { productId: "prod_007", productName: "Dental Care Chews for Dogs", unitPrice: 25000, quantity: 1 },
      { productId: "prod_007", productName: "Dental Care Chews for Dogs", unitPrice: 25000, quantity: 1 },
    ],
    totalPrice: 88500,
    deliveryAddress: "Damascus, Rawda, Park Square 5",
    paymentMethod: "cash_on_delivery",
    status: "pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    _id: "ord_004",
    referenceCode: "RF-2045",
    customerId: "cust_004",
    customerName: "Hiba Qabbani",
    customerPhone: "0966445566",
    storeId: "store_001",
    items: [
      { productId: "prod_005", productName: "Multi-Level Cat Scratching Tree", unitPrice: 210000, quantity: 1 },
    ],
    totalPrice: 230000,
    deliveryAddress: "Damascus, Mezzeh Villas, St 3",
    paymentMethod: "cash_on_delivery",
    status: "approved",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: "ord_005",
    referenceCode: "RF-2044",
    customerId: "cust_005",
    customerName: "Ziad Nader",
    customerPhone: "0977556677",
    storeId: "store_001",
    items: [
      { productId: "prod_006", productName: "Organic Oatmeal Pet Shampoo (500ml)", unitPrice: 42000, quantity: 1 },
    ],
    totalPrice: 45000,
    deliveryAddress: "Damascus, Dummar Project",
    paymentMethod: "cash_on_delivery",
    status: "rejected",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];
