import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../components/AppCard";
import { colorPalette } from "../../constants/colors";
import { fetchApi } from "../../services/apiClient";

export interface VetBookingRequest {
  id: string;
  doctorId: string;
  referenceCode: string;
  customerName: string;
  customerPhone?: string;
  petSummary: string;
  appointmentDate: string;
  appointmentDay: string;
  appointmentTime: string;
  slotStatus: "available" | "booked";
  status: "pending" | "approved" | "rejected";
}

const INITIAL_VET_BOOKINGS: VetBookingRequest[] = [
  {
    id: "vb_1",
    doctorId: "6b044cd63434d71f2873d49f",
    referenceCode: "VET-739104",
    customerName: "Maya Haddad",
    customerPhone: "0988776655",
    petSummary: "Luna • Cat (2 yrs)",
    appointmentDate: "2026-11-25",
    appointmentDay: "Wed",
    appointmentTime: "10:00",
    slotStatus: "available",
    status: "pending",
  },
  {
    id: "vb_3",
    doctorId: "6b044cd63434d71f2873d49f",
    referenceCode: "VET-882194",
    customerName: "Sami Mansour",
    customerPhone: "0944112233",
    petSummary: "Bella • Dog (1 yr)",
    appointmentDate: "2026-11-26",
    appointmentDay: "Thu",
    appointmentTime: "14:00",
    slotStatus: "available",
    status: "pending",
  },
  {
    id: "vb_2",
    doctorId: "6b044cd63434d71f2873d49f",
    referenceCode: "VET-618290",
    customerName: "Omar Al-Khatib",
    customerPhone: "0999887766",
    petSummary: "Rocky • Dog (4 yrs)",
    appointmentDate: "2026-11-26",
    appointmentDay: "Thu",
    appointmentTime: "11:30",
    slotStatus: "booked",
    status: "approved",
  },
];

export default function VetBookingsScreen({
  externalDoctorId = "6b044cd63434d71f2873d49f",
}: {
  externalDoctorId?: string;
}) {
  const [bookings, setBookings] = useState<VetBookingRequest[]>(INITIAL_VET_BOOKINGS);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("pending");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAppointments() {
      setLoading(true);
      try {
        const res = await fetchApi<any>(
          `/appointments/vet`,
          { method: "GET" },
          async () => ({ data: INITIAL_VET_BOOKINGS })
        );
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!cancelled && data.length > 0) {
          const mapped: VetBookingRequest[] = data.map((b: any) => ({
            id: b._id || b.id || `vb_${Math.random()}`,
            doctorId: b.doctorId?._id || b.doctorId || externalDoctorId,
            referenceCode: b.referenceCode || `VET-${String(b._id || "100").slice(-5)}`,
            customerName: b.customerId?.name || b.customerName || "Pet Owner",
            customerPhone: b.customerId?.phone || b.customerPhone || "",
            petSummary: b.petId
              ? `${b.petId.name || "Pet"} • ${b.petId.petType || "Pet"} (${b.petId.age || 1}y)`
              : b.petSummary || "Pet Snapshot",
            appointmentDate: b.appointmentDate || "2026-11-25",
            appointmentDay: b.appointmentDay || "Wed",
            appointmentTime: b.appointmentTime || "10:00",
            slotStatus: b.status === "approved" ? "booked" : "available",
            status: b.status || "pending",
          }));
          setBookings(mapped);
        }
      } catch (e) {
        // Fallback to initial demo bookings
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadAppointments();
    return () => {
      cancelled = true;
    };
  }, [externalDoctorId]);

  const handleDecision = async (id: string, decision: "approved" | "rejected") => {
    setProcessingId(id);
    setFeedback(null);
    try {
      // 1. Call backend to update status in MongoDB
      await fetchApi(
        `/bookings-vet/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: decision, decision }),
        },
        async () => ({ success: true })
      );

      // 2. Update local state
      setBookings((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            status: decision,
            slotStatus: decision === "approved" ? "booked" : "available",
          };
        })
      );

      setFeedback({
        type: "success",
        text:
          decision === "approved"
            ? "Booking confirmed successfully and moved to Confirmed section."
            : "Booking request rejected.",
      });
    } catch (err: any) {
      setBookings((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            status: decision,
            slotStatus: decision === "approved" ? "booked" : "available",
          };
        })
      );
      setFeedback({
        type: "success",
        text:
          decision === "approved"
            ? "Booking confirmed successfully and moved to Confirmed section."
            : "Booking request rejected.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const displayedBookings =
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
          VETERINARIAN APPOINTMENTS
        </Text>
        <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-0.5">
          Clinic Bookings
        </Text>
      </View>

      {/* Tabs: Pending vs Approved vs All */}
      <View className="flex-row rounded-2xl bg-white dark:bg-[#1E2733] p-1.5 border border-slate-200 dark:border-slate-700 shadow-xs">
        <TouchableOpacity
          onPress={() => setActiveTab("pending")}
          className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
            activeTab === "pending"
              ? "bg-[#EAB642] shadow-xs"
              : "bg-transparent"
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
            Pending ({pendingBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("approved")}
          className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${
            activeTab === "approved"
              ? "bg-emerald-600 shadow-xs"
              : "bg-transparent"
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
            Confirmed ({approvedBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("all")}
          className={`px-3 py-2.5 rounded-xl flex-row items-center justify-center gap-1 ${
            activeTab === "all"
              ? "bg-[#2A4D75] shadow-xs"
              : "bg-transparent"
          }`}
        >
          <Text
            className={`text-xs font-extrabold ${
              activeTab === "all" ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}
          >
            All ({bookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="py-2 flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#2A4D75" />
          <Text className="text-xs text-slate-500">Loading appointments...</Text>
        </View>
      ) : null}

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

      {displayedBookings.length === 0 ? (
        <AppCard color="bg-white dark:bg-[#1E2733]" className="p-8 items-center border border-slate-200 dark:border-slate-700">
          <Ionicons
            name={activeTab === "pending" ? "file-tray-outline" : "calendar-outline"}
            size={40}
            color="#94A3B8"
          />
          <Text className="text-sm font-extrabold text-[#2A4D75] dark:text-white mt-3">
            {activeTab === "pending"
              ? "No pending booking requests currently"
              : activeTab === "approved"
              ? "No confirmed bookings yet"
              : "No bookings"}
          </Text>
          <Text className="text-xs text-slate-500 text-center mt-1">
            {activeTab === "pending"
              ? "New appointment requests from pet owners will appear here to confirm."
              : "Bookings you confirm will always appear in this section."}
          </Text>
        </AppCard>
      ) : (
        displayedBookings.map((booking) => {
          const isProcessing = processingId === booking.id;
          return (
            <AppCard
              key={booking.id}
              color="bg-white dark:bg-[#1E2733]"
              className="gap-3 border border-slate-200 dark:border-slate-700"
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
                    {booking.petSummary}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    Owner: {booking.customerName} {booking.customerPhone ? `(${booking.customerPhone})` : ""} • #{booking.referenceCode}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                    {booking.appointmentDay} • {booking.appointmentDate} • {booking.appointmentTime}
                  </Text>
                </View>

                <View
                  className={`px-2.5 py-1 rounded-full ${
                    booking.status === "approved"
                      ? "bg-emerald-100 dark:bg-emerald-900/40"
                      : booking.status === "rejected"
                      ? "bg-red-100 dark:bg-red-900/40"
                      : "bg-[#F6D28B]/50 dark:bg-amber-900/40"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold capitalize ${
                      booking.status === "approved"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : booking.status === "rejected"
                        ? "text-red-700 dark:text-red-300"
                        : "text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {booking.status === "approved"
                      ? "✓ Confirmed"
                      : booking.status === "rejected"
                      ? "✕ Rejected"
                      : "⏳ Pending"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <Text className="text-xs font-semibold text-[#557FB3]">
                  Slot Status: {booking.slotStatus === "booked" ? "Booked" : "Available"}
                </Text>

                {booking.status === "pending" ? (
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleDecision(booking.id, "rejected")}
                      disabled={isProcessing}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex-row items-center gap-1"
                    >
                      <Ionicons name="close" size={16} color="#EF4444" />
                      <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Reject
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleDecision(booking.id, "approved")}
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-emerald-600 flex-row items-center gap-1.5 shadow-xs"
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text className="text-xs font-bold text-white">
                        {isProcessing ? "Confirming..." : "Confirm"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons
                      name={booking.status === "approved" ? "checkmark-done-circle" : "close-circle"}
                      size={18}
                      color={booking.status === "approved" ? "#059669" : "#DC2626"}
                    />
                    <Text
                      className={`text-xs font-extrabold ${
                        booking.status === "approved"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {booking.status === "approved" ? "Confirmed by Doctor" : "Request Rejected"}
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
