import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBar";
import AppCard from "../../components/AppCard";
import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import { colorPalette } from "../../constants/colors";
import { fetchApi } from "../../services/apiClient";

interface StoreProduct {
  id: string;
  storeId: string;
  name: string;
  details: string;
  price: number;
  imageUrl: string;
  status: "available" | "unavailable";
}

interface StoreItem {
  id: string;
  name: string;
  address: string;
  status: "active" | "closed";
  products: StoreProduct[];
}

const MOCK_STORES: StoreItem[] = [
  {
    id: "st_1",
    name: "Paws & Claws Market",
    address: "Al-Malki, Damascus",
    status: "active",
    products: [
      {
        id: "p_1",
        storeId: "st_1",
        name: "Adult Cat Food",
        details: "2kg • Chicken & Rice",
        price: 35000,
        imageUrl:
          "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
        status: "available",
      },
      {
        id: "p_2",
        storeId: "st_1",
        name: "Salmon Treats",
        details: "100g • Grain-free",
        price: 15000,
        imageUrl:
          "https://images.unsplash.com/photo-1568640347023-a616a30b3bd2?w=400",
        status: "available",
      },
      {
        id: "p_3",
        storeId: "st_1",
        name: "Disabled Collar",
        details: "Unavailable item",
        price: 12000,
        imageUrl:
          "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400",
        status: "unavailable",
      },
    ],
  },
  {
    id: "st_2",
    name: "Happy Pet Supplies",
    address: "Mezzeh, Damascus",
    status: "active",
    products: [
      {
        id: "p_4",
        storeId: "st_2",
        name: "Rubber Chew Toy",
        details: "Durable • Non-toxic",
        price: 18000,
        imageUrl:
          "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400",
        status: "available",
      },
    ],
  },
];

export default function StoresScreen() {
  const [stores, setStores] = useState<StoreItem[]>(MOCK_STORES);
  const [loadingStores, setLoadingStores] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadBackendStores() {
      try {
        setLoadingStores(true);
        const res = await fetchApi<any>("/stores");
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (cancelled) return;
        if (list.length > 0) {
          const mapped: StoreItem[] = await Promise.all(
            list.map(async (st: any) => {
              const storeId = st._id || st.id;
              let products: StoreProduct[] = [];
              try {
                const prodRes = await fetchApi<any>(`/stores/${storeId}/products`);
                const prodList = Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : [];
                if (prodList.length > 0) {
                  products = prodList.map((p: any) => ({
                    id: p._id || p.id,
                    storeId,
                    name: p.name,
                    details: p.details || "",
                    price: Number(p.price) || 0,
                    imageUrl:
                      p.imageUrl ||
                      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
                    status: p.status || "available",
                  }));
                }
              } catch {}

              if (products.length === 0) {
                products = [
                  {
                    id: `${storeId}_p1`,
                    storeId,
                    name: "Royal Canin Mini Adult (3kg)",
                    details: "Premium balanced nutrition for adult dogs.",
                    price: 150000,
                    imageUrl: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400",
                    status: "available",
                  },
                  {
                    id: `${storeId}_p2`,
                    storeId,
                    name: "Purina Pro Plan Cat Salmon",
                    details: "High-protein dry cat food rich in omega fatty acids.",
                    price: 120000,
                    imageUrl: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400",
                    status: "available",
                  },
                  {
                    id: `${storeId}_p3`,
                    storeId,
                    name: "Ergonomic Reflective Dog Harness",
                    details: "Breathable padded vest harness.",
                    price: 65000,
                    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
                    status: "available",
                  },
                  {
                    id: `${storeId}_p4`,
                    storeId,
                    name: "Stainless Steel Pet Bowl",
                    details: "Durable anti-slip food & water bowl.",
                    price: 35000,
                    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400",
                    status: "available",
                  },
                ];
              }

              return {
                id: storeId,
                name: st.name || "Happy Paws Pet Store",
                address: st.address || "Damascus",
                status: st.status || "active",
                products,
              };
            })
          );
          if (!cancelled && mapped.length > 0) {
            setStores(mapped);
            setSelectedStoreId(mapped[0]?.id || "");
          }
        }
      } catch (err) {
        // Keep mock stores on network error
      } finally {
        if (!cancelled) setLoadingStores(false);
      }
    }
    void loadBackendStores();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeStores = useMemo(
    () => stores.filter((s) => s.status === "active"),
    [stores]
  );

  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    activeStores[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<
    { id: string; name: string; price: number; quantity: number }[]
  >([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  const selectedStore = useMemo(() => {
    return (
      activeStores.find((s) => s.id === selectedStoreId) ||
      activeStores[0] ||
      null
    );
  }, [activeStores, selectedStoreId]);

  const filteredProducts = useMemo(() => {
    if (!selectedStore) return [];
    const availableItems = selectedStore.products.filter(
      (p) => p.status === "available"
    );
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableItems;
    return availableItems.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.details.toLowerCase().includes(q)
    );
  }, [selectedStore, searchQuery]);

  const addToCart = (prod: StoreProduct) => {
    setCheckoutSuccess("");
    setCart((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        { id: prod.id, name: prod.name, price: prod.price, quantity: 1 },
      ];
    });
  };

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleConfirmPurchase = async () => {
    setCheckoutError("");
    if (!deliveryAddress.trim()) {
      setCheckoutError("Please fill in all fields.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const targetStoreId = selectedStore?.id || "6b0437d44e9594edc2d011eb";
      await fetchApi<any>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          deliveryAddress: deliveryAddress.trim(),
          storeId: targetStoreId,
          items: cart.map((item) => ({
            productId: item.id,
            productName: item.name,
            unitPrice: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      setCheckoutSuccess("Order placed successfully! Sent to store dashboard for confirmation.");
      setCart([]);
      setDeliveryAddress("");
      setIsCartOpen(false);
    } catch (err: any) {
      setCheckoutError(err?.message || "Failed to place order.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 95 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs uppercase font-bold text-[#557FB3]">
              PET SUPPLIES
            </Text>
            <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white">
              Stores
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setCheckoutError("");
              setIsCartOpen(true);
            }}
            className="p-3 bg-white rounded-2xl border border-slate-200 relative"
          >
            <Ionicons
              name="cart-outline"
              size={24}
              color={colorPalette.navyDark}
            />
            {cart.length > 0 ? (
              <View className="absolute -top-1 -right-1 bg-[#EAB642] w-5 h-5 rounded-full items-center justify-center">
                <Text className="text-xs font-bold text-white">
                  {cart.length}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Active stores selector (list remains visible) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {activeStores.map((st) => {
              const isActiveSt = selectedStore?.id === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setSelectedStoreId(st.id)}
                  className={`px-3.5 py-2 rounded-xl border flex-row items-center gap-1.5 ${
                    isActiveSt
                      ? "bg-[#2A4D75] border-[#2A4D75]"
                      : "bg-white border-slate-300"
                  }`}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={15}
                    color={isActiveSt ? "#FFFFFF" : colorPalette.navyDark}
                  />
                  <Text
                    className={`text-xs font-bold ${
                      isActiveSt ? "text-white" : "text-[#2A4D75]"
                    }`}
                  >
                    {st.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
        />

        {checkoutSuccess ? (
          <View className="px-3.5 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300">
            <Text className="text-xs font-bold text-emerald-800">
              {checkoutSuccess}
            </Text>
          </View>
        ) : null}

        <View className="flex-row flex-wrap gap-3">
          {filteredProducts.map((prod) => (
            <AppCard
              key={prod.id}
              color="bg-white dark:bg-[#1E2733]"
              className="w-[48%] gap-2 border border-slate-200 dark:border-slate-700"
            >
              <Image
                source={{ uri: prod.imageUrl }}
                className="w-full h-24 rounded-xl bg-slate-100"
                resizeMode="cover"
              />
              <Text className="text-sm font-extrabold text-[#2A4D75] dark:text-white">
                {prod.name}
              </Text>
              <Text className="text-xs text-slate-500">{prod.details}</Text>
              <Text className="text-sm font-extrabold text-[#557FB3]">
                {(Number(prod.price) || 0).toLocaleString()} SYP
              </Text>
              <TouchableOpacity
                onPress={() => addToCart(prod)}
                activeOpacity={0.8}
                style={{ backgroundColor: "#EFBB44" }}
                className="w-full py-2.5 px-3 rounded-xl flex-row items-center justify-center gap-1.5 mt-1 shadow-xs active:scale-95"
              >
                <Ionicons name="cart-outline" size={16} color="#0F172A" />
                <Text className="text-xs font-extrabold text-slate-900">
                  Add to cart
                </Text>
              </TouchableOpacity>
            </AppCard>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={isCartOpen}
        animationType="slide"
        onRequestClose={() => setIsCartOpen(false)}
      >
        <View className="flex-1 bg-[#E4EAF1] p-6 justify-between">
          <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
            <TouchableOpacity
              onPress={() => setIsCartOpen(false)}
              className="self-start"
            >
              <Ionicons name="close" size={28} color={colorPalette.navyDark} />
            </TouchableOpacity>

            <Text className="text-2xl font-extrabold text-[#2A4D75]">
              Your Cart
            </Text>

            {checkoutError ? (
              <View className="px-3.5 py-2.5 rounded-xl bg-red-100 border border-red-300">
                <Text className="text-xs font-bold text-red-800">
                  {checkoutError}
                </Text>
              </View>
            ) : null}

            {cart.length === 0 ? (
              <Text className="text-sm text-slate-600">Your cart is empty.</Text>
            ) : (
              <>
                {cart.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200"
                  >
                    <Text className="font-bold text-[#2A4D75]">
                      {item.name} (x{item.quantity})
                    </Text>
                    <Text className="font-bold text-[#557FB3]">
                      {(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()} SYP
                    </Text>
                  </View>
                ))}

                <Text className="text-lg font-extrabold text-[#2A4D75] mt-2">
                  Total: {(Number(totalPrice) || 0).toLocaleString()} SYP
                </Text>

                <AppInput
                  leftIcon="location-outline"
                  value={deliveryAddress}
                  onChangeText={(txt) => {
                    setDeliveryAddress(txt);
                    if (checkoutError) setCheckoutError("");
                  }}
                  placeholder="Delivery address *"
                />

                <Text className="text-xs font-bold text-[#557FB3]">
                  Cash on Delivery
                </Text>
              </>
            )}
          </ScrollView>

          {cart.length > 0 ? (
            <AppButton
              title={checkoutLoading ? "Placing Order..." : "Confirm Purchase"}
              disabled={checkoutLoading}
              onPress={handleConfirmPurchase}
              color="bg-[#EFBB44]"
              textColor="text-slate-900"
              textClassName="font-extrabold text-base"
            />
          ) : null}
        </View>
      </Modal>
    </View>
  );
}