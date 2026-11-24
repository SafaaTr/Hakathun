import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../../components/SearchBar";
import AppCard from "../../components/AppCard";
import { colorPalette } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { fetchApi } from "../../services/apiClient";

interface CaregiverItem {
  id: string;
  name: string;
  placeType: "home" | "barn";
  address: string;
  acceptedPetType: string;
  pricingType: "free" | "paid";
  dailyPrice: number | null;
  foodCost: string;
  status: "available" | "unavailable";
  avgRating?: number;
  ratingsCount?: number;
}

const MOCK_CAREGIVERS: CaregiverItem[] = [
  {
    id: "host_1",
    name: "Salma Darwish",
    placeType: "home",
    address: "Al-Malki, Damascus",
    acceptedPetType: "Cats & Small Dogs",
    pricingType: "paid",
    dailyPrice: 25000,
    foodCost: "Not needed",
    status: "available",
    avgRating: 4.8,
    ratingsCount: 12,
  },
  {
    id: "host_2",
    name: "Karim Mansour",
    placeType: "home",
    address: "Mezzeh, Damascus",
    acceptedPetType: "Cats Only",
    pricingType: "free",
    dailyPrice: null,
    foodCost: "5000",
    status: "available",
    avgRating: undefined,
    ratingsCount: 0,
  },
  {
    id: "host_3",
    name: "Disabled Host Example",
    placeType: "barn",
    address: "Jaramana, Damascus",
    acceptedPetType: "Dogs",
    pricingType: "paid",
    dailyPrice: 20000,
    foodCost: "Not needed",
    status: "unavailable",
    avgRating: 4.0,
    ratingsCount: 3,
  },
];

export default function HostCaregiversScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [caregivers, setCaregivers] = useState<HostCaregiverItem[]>(MOCK_CAREGIVERS);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [foodNotes, setFoodNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadHosts() {
      try {
        const res = await fetchApi<any>("/admin/hosts", { method: "GET" });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (active && list.length > 0) {
          const mapped: HostCaregiverItem[] = list.map((h: any) => ({
            id: h._id || h.hostUserId || h.userId || `host_${Date.now()}`,
            name: h.name || h.hostName || "Host Caregiver",
            placeType: (h.placeType as PlaceType) || "home",
            address: h.address || "Damascus",
            acceptedPetType: h.acceptedPetType || "Cats & Small Dogs",
            pricingType: (h.pricingType as PricingType) || "paid",
            dailyPrice: typeof h.dailyPrice === "number" ? h.dailyPrice : 25000,
            foodCost: h.foodCost || "Not needed",
            status: h.status === "unavailable" ? "unavailable" : "available",
            avgRating: typeof h.avgRating === "number" ? h.avgRating : 5.0,
            ratingsCount: typeof h.ratingsCount === "number" ? h.ratingsCount : 1,
          }));
          setCaregivers(mapped);
        }
      } catch (err) {
        // Fallback to MOCK_CAREGIVERS
      }
    }
    void loadHosts();
    return () => {
      active = false;
    };
  }, []);

  const availableCaregivers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return caregivers.filter((cg) => cg.status === "available").filter(
      (cg) => {
        if (!q) return true;
        return (
          cg.name.toLowerCase().includes(q) ||
          cg.acceptedPetType.toLowerCase().includes(q) ||
          cg.address.toLowerCase().includes(q)
        );
      }
    );
  }, [caregivers, searchQuery]);

  const handleSubmitHostingRequest = async (hostId: string, hostName: string) => {
    setFeedback(null);
    if (!startDate.trim() || !endDate.trim() || !foodNotes.trim()) {
      setFeedback({
        type: "error",
        text: "Please fill in all fields.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi<any>("/host-bookings", {
        method: "POST",
        body: JSON.stringify({
          hostUserId: hostId,
          petId: user?.pet?._id || user?.pet?.id,
          startDate: startDate.trim(),
          endDate: endDate.trim(),
          foodNotes: foodNotes.trim(),
        }),
      });

      setFeedback({
        type: "success",
        text: "Your request has been sent, you will receive a response.",
      });
      setSelectedHostId(null);
      setStartDate("");
      setEndDate("");
      setFoodNotes("");
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to submit hosting request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]"
      contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 95 }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text className="text-xs uppercase font-bold text-[#557FB3]">
          TEMPORARY PET CARE
        </Text>
        <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-0.5">
          Host Caregivers
        </Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search host, pet type, or address..."
      />

      {feedback ? (
        <View
          className={`px-3.5 py-2.5 rounded-xl border ${
            feedback.type === "error"
              ? "bg-red-100 border-red-300"
              : "bg-emerald-100 border-emerald-300"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              feedback.type === "error" ? "text-red-800" : "text-emerald-800"
            }`}
          >
            {feedback.text}
          </Text>
        </View>
      ) : null}

      {availableCaregivers.map((cg) => {
        const isFormOpen = selectedHostId === cg.id;
        const ratingLabel =
          cg.ratingsCount && cg.ratingsCount > 0 && typeof cg.avgRating === "number"
            ? `${cg.avgRating.toFixed(1)} (${cg.ratingsCount})`
            : "No ratings yet";

        const priceLabel =
          cg.pricingType === "paid" && typeof cg.dailyPrice === "number"
            ? `${(Number(cg.dailyPrice) || 0).toLocaleString()} SYP / day`
            : "Free";

        return (
          <AppCard
            key={cg.id}
            color="bg-white dark:bg-[#1E2733]"
            className="gap-3 border border-slate-200 dark:border-slate-700"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-[#E4EAF1] dark:bg-slate-800 items-center justify-center">
                <Ionicons
                  name="home"
                  size={20}
                  color={colorPalette.navyDark}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
                  {cg.name}
                </Text>
                <Text className="text-xs text-slate-500">
                  {cg.acceptedPetType} • {cg.address} ({cg.placeType})
                </Text>
              </View>
              <Text className="text-xs font-extrabold text-[#557FB3]">
                {priceLabel}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold text-[#557FB3]">
                {ratingLabel}
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-300">
                Food cost: <Text className="font-bold">{cg.foodCost}</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setFeedback(null);
                setSelectedHostId(isFormOpen ? null : cg.id);
              }}
              className="py-2.5 rounded-xl bg-[#EAB642] items-center"
            >
              <Text className="text-xs font-extrabold text-white">
                {isFormOpen ? "Close" : "Book"}
              </Text>
            </TouchableOpacity>

            {isFormOpen ? (
              <View className="gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="Start date (YYYY-MM-DD)"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#2A4D75]"
                />
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="End date (YYYY-MM-DD)"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#2A4D75]"
                />
                <TextInput
                  value={foodNotes}
                  onChangeText={setFoodNotes}
                  placeholder="Food notes"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#2A4D75]"
                />
                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={() => handleSubmitHostingRequest(cg.id, cg.name)}
                  className="py-2.5 rounded-xl bg-[#2A4D75] items-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-xs font-bold text-white">
                      Submit Hosting Request
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </AppCard>
        );
      })}
    </ScrollView>
  );
}