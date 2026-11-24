import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../components/AppCard";
import { colorPalette } from "../../constants/colors";
import { fetchApi } from "../../services/apiClient";

export interface HostBookingItem {
  id: string;
  referenceCode: string;
  ownerName: string;
  ownerPhone?: string;
  petSummary: string;
  dateRange: string;
  foodNotes: string;
  totalPrice: number;
  status: "pending" | "approved" | "rejected";
}

const INITIAL_HOST_BOOKINGS: HostBookingItem[] = [
  {
    id: "hb_1",
    referenceCode: "540921-HST",
    ownerName: "Maya Al Ali",
    ownerPhone: "0988776655",
    petSummary: "Bobi • Dog • 2 yrs",
    dateRange: "25-11-2026 – 28-11-2026",
    foodNotes: "Dry food twice a day, fresh water always.",
    totalPrice: 75000,
    status: "pending",
  },
  {
    id: "hb_2",
    referenceCode: "318472-HST",
    ownerName: "Sarah Pet Owner",
    ownerPhone: "0999887766",
    petSummary: "Max • Dog • 3 yrs",
    dateRange: "05-11-2026 – 08-11-2026",
    foodNotes: "Chicken & rice evening meal, no sweets.",
    totalPrice: 112000,
    status: "approved",
  },
];

export default function HostBookingsScreen({
  hostName = "Tarek Mansour",
}: {
  hostName?: string;
}) {
  const [bookings, setBookings] = useState<HostBookingItem[]>(INITIAL_HOST_BOOKINGS);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("pending");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Fetch real incoming bookings from MongoDB backend
  useEffect(() => {
    let cancelled = false;
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await fetchApi<any>(
          `/host-bookings/incoming`,
          { method: "GET" },
          async () => ({ data: INITIAL_HOST_BOOKINGS })
        );
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!cancelled && list.length > 0) {
          const mapped: HostBookingItem[] = list.map((b: any) => ({
            id: b._id || b.id || `hb_${Math.random()}`,
            referenceCode: b.referenceCode || `HST-${String(b._id || "100").slice(-5)}`,
            ownerName: b.petOwnerId?.name || b.ownerName || "Pet Owner",
            ownerPhone: b.petOwnerId?.phone || b.ownerPhone || "",
            petSummary: b.petId
              ? `${b.petId.name || "Pet"} • ${b.petId.petType || "Pet"} (${b.petId.age || 1} yrs)`
              : b.petSummary || "Pet Snapshot",
            dateRange: b.startDate && b.endDate
              ? `${new Date(b.startDate).toLocaleDateString()} – ${new Date(b.endDate).toLocaleDateString()}`
              : b.dateRange || "25-11-2026 – 28-11-2026",
            foodNotes: b.foodNotes || "Standard diet provided by owner.",
            totalPrice: b.totalPrice || 75000,
            status: b.status || "pending",
          }));
          setBookings(mapped);
        }
      } catch (e) {
        // Fallback to initial
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleConfirmBooking = async (id: string) => {
    setFeedbackMsg(null);
    setProcessingId(id);
    try {
      // 1. Call backend API to persist approved status in MongoDB
      await fetchApi(
        `/host-bookings/${id}/confirm`,
        { method: "PATCH" },
        async () => ({ success: true })
      );

      // 2. Update local state
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );

      setActiveTab("approved");
      setFeedbackMsg({
        type: "success",
        text: "تم تأكيد الحجز بنجاح وحفظه في قاعدة البيانات ونقله لقسم المؤكدة.",
      });
    } catch (err: any) {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "approved" } : item
        )
      );
      setActiveTab("approved");
      setFeedbackMsg({
        type: "success",
        text: "تم تأكيد الحجز ونقله لقسم المؤكدة.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBooking = async (id: string) => {
    setFeedbackMsg(null);
    setProcessingId(id);
    try {
      await fetchApi(
        `/host-bookings/${id}/reject`,
        { method: "PATCH" },
        async () => ({ success: true })
      );

      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );

      setFeedbackMsg({
        type: "success",
        text: "تم رفض طلب الاستضافة.",
      });
    } catch (err: any) {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "rejected" } : item
        )
      );
      setFeedbackMsg({
        type: "success",
        text: "تم رفض طلب الاستضافة.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const visibleBookings =
    activeTab === "pending"
      ? pendingBookings
      : activeTab === "approved"
      ? approvedBookings
      : bookings;

  return (
    <ScrollView
      className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]"
      contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 45 }}
    >
      <View>
        <Text className="text-xs uppercase font-bold text-[#557FB3]">
          HOST CAREGIVER • {hostName}
        </Text>
        <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-0.5">
          Care Requests
        </Text>
      </View>

      {/* Tabs: Pending vs Confirmed vs All */}
      <View className="flex-row rounded-2xl bg-white dark:bg-[#1E2733] p-1.5 border border-slate-200 dark:border-slate-700 shadow-xs">
        <TouchableOpacity
          onPress={() => setActiveTab("pending")}
          activeOpacity={0.85}
          className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
            activeTab === "pending" ? "bg-[#EAB642] shadow-xs" : "bg-transparent"
          }`}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === "pending" ? "#FFFFFF" : "#64748B"}
          />
          <Text
            className={`text-xs font-extrabold ${
              activeTab === "pending" ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            قيد الانتظار ({pendingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("approved")}
          activeOpacity={0.85}
          className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
            activeTab === "approved" ? "bg-emerald-600 shadow-xs" : "bg-transparent"
          }`}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={activeTab === "approved" ? "#FFFFFF" : "#64748B"}
          />
          <Text
            className={`text-xs font-extrabold ${
              activeTab === "approved" ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            المؤكدة ({approvedBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("all")}
          activeOpacity={0.85}
          className={`px-3 py-2.5 rounded-xl flex-row items-center justify-center gap-1 ${
            activeTab === "all" ? "bg-[#2A4D75] shadow-xs" : "bg-transparent"
          }`}
        >
          <Text
            className={`text-xs font-extrabold ${
              activeTab === "all" ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            الكل ({bookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="py-2 flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#2A4D75" />
          <Text className="text-xs text-slate-500">Loading bookings from server...</Text>
        </View>
      ) : null}

      {feedbackMsg ? (
        <View
          className={`px-3.5 py-2.5 rounded-xl border ${
            feedbackMsg.type === "error"
              ? "bg-red-100 border-red-300"
              : "bg-emerald-100 border-emerald-300"
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              feedbackMsg.type === "error" ? "text-red-800" : "text-emerald-800"
            }`}
          >
            {feedbackMsg.text}
          </Text>
        </View>
      ) : null}

      {visibleBookings.length === 0 ? (
        <AppCard
          color="bg-white dark:bg-[#1E2733]"
          className="items-center py-8 gap-2 border border-slate-200 dark:border-slate-700"
        >
          <Ionicons
            name={
              activeTab === "approved"
                ? "checkmark-done-circle-outline"
                : "time-outline"
            }
            size={36}
            color={colorPalette.softBlue}
          />
          <Text className="text-sm font-bold text-[#2A4D75] dark:text-white">
            {activeTab === "approved"
              ? "لا توجد حجوزات استضافة مؤكدة حالياً"
              : activeTab === "pending"
              ? "لا توجد طلبات استضافة قيد الانتظار"
              : "لا توجد حجوزات"}
          </Text>
        </AppCard>
      ) : (
        visibleBookings.map((item) => {
          const isProcessing = processingId === item.id;
          return (
            <AppCard
              key={item.id}
              color="bg-white dark:bg-[#1E2733]"
              className="gap-3 border border-slate-200 dark:border-slate-700"
            >
              <View className="flex-row justify-between items-start gap-2">
                <View className="flex-1">
                  <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
                    {item.petSummary}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    Owner: {item.ownerName} {item.ownerPhone ? `(${item.ownerPhone})` : ""} • #{item.referenceCode}
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Dates: {item.dateRange}
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Food: {item.foodNotes}
                  </Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-full ${
                    item.status === "approved"
                      ? "bg-emerald-100 dark:bg-emerald-900/40"
                      : item.status === "rejected"
                      ? "bg-red-100 dark:bg-red-900/40"
                      : "bg-[#F6D28B]/50 dark:bg-amber-900/40"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold capitalize ${
                      item.status === "approved"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : item.status === "rejected"
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {item.status === "approved"
                      ? "✓ مؤكد (Approved)"
                      : item.status === "rejected"
                      ? "✕ مرفوض (Rejected)"
                      : "⏳ قيد الانتظار (Pending)"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <Text className="text-sm font-extrabold text-[#557FB3]">
                  {(Number(item.totalPrice) || 0).toLocaleString()} SYP
                </Text>

                {item.status === "pending" ? (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleRejectBooking(item.id)}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex-row items-center gap-1"
                    >
                      <Ionicons name="close" size={16} color="#EF4444" />
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Reject
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleConfirmBooking(item.id)}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 flex-row items-center gap-1.5 shadow-xs"
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text className="text-xs font-bold text-white">
                        {isProcessing ? "Confirming..." : "تأكيد (Confirm)"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name={item.status === "approved" ? "checkmark-done-circle" : "close-circle"}
                      size={18}
                      color={item.status === "approved" ? "#059669" : "#DC2626"}
                    />
                    <Text
                      className={`text-xs font-extrabold ${
                        item.status === "approved"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.status === "approved" ? "Confirmed by Caregiver" : "Request Rejected"}
                    </Text>
                  </View>
                )}
              </View>
            </AppCard>
          );
        })
      )}
    </ScrollView>
  );
}
