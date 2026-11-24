import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../components/AppCard";
import { colorPalette } from "../../constants/colors";
import { fetchApi } from "../../services/apiClient";

export interface VetSlotItem {
  slotId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  day: string; // Mon, Tue, ...
  time: string; // HH:mm (24h)
  status: "available" | "booked";
}

interface VetScheduleScreenProps {
  externalDoctorId?: string;
  doctorName?: string;
}

function formatDate(offsetDays: number): { date: string; day: string } {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    date: `${yyyy}-${mm}-${dd}`,
    day: days[d.getDay()],
  };
}

export default function VetScheduleScreen({
  externalDoctorId = "6b044cd63434d71f2873d49f",
  doctorName = "Dr. Zaid Khouri",
}: VetScheduleScreenProps) {
  const tomorrow = formatDate(1);
  const [slots, setSlots] = useState<VetSlotItem[]>([]);
  const [dateInput, setDateInput] = useState(tomorrow.date);
  const [dayInput, setDayInput] = useState(tomorrow.day);
  const [timeInput, setTimeInput] = useState("10:00");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Load existing slots from backend
  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      try {
        const res = await fetchApi<any>(
          `/doctors/${externalDoctorId}/slots`,
          { method: "GET" },
          async () => []
        );
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (!cancelled && data.length > 0) {
          const mapped: VetSlotItem[] = data.map((s: any) => ({
            slotId: s.slotId || s._id || `s_${Math.random()}`,
            doctorId: externalDoctorId,
            date: s.date,
            day: s.day,
            time: s.time,
            status: s.status || "available",
          }));
          setSlots(mapped);
        }
      } catch (e) {
        // Fallback
      }
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [externalDoctorId]);

  const handleSelectQuickDate = (offset: number) => {
    const f = formatDate(offset);
    setDateInput(f.date);
    setDayInput(f.day);
  };

  const handleAddSlot = async () => {
    setFeedback(null);

    const trimmedDate = dateInput.trim();
    const trimmedDay = dayInput.trim();
    const trimmedTime = timeInput.trim();

    if (!trimmedDate || !trimmedDay || !trimmedTime) {
      setFeedback({
        type: "error",
        text: "Please fill in date, day, and time.",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Save to backend database
      await fetchApi(
        `/doctors/${externalDoctorId}/slots`,
        {
          method: "POST",
          body: JSON.stringify({
            date: trimmedDate,
            day: trimmedDay,
            time: trimmedTime,
          }),
        },
        async () => ({ success: true })
      );

      const newSlot: VetSlotItem = {
        slotId: `slot_${Date.now()}`,
        doctorId: externalDoctorId,
        date: trimmedDate,
        day: trimmedDay,
        time: trimmedTime,
        status: "available",
      };

      setSlots((prev) => [
        newSlot,
        ...prev.filter(
          (s) => !(s.date === trimmedDate && s.time === trimmedTime)
        ),
      ]);

      setFeedback({
        type: "success",
        text: "Appointment slot saved successfully and is now visible to pet owners.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to save appointment slot.",
      });
    } finally {
      setLoading(false);
    }
  };

  const doctorSlots = slots.filter((s) => s.doctorId === externalDoctorId || !s.doctorId);

  return (
    <ScrollView
      className="flex-1 bg-[#E4EAF1] dark:bg-[#121820]"
      contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 45 }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Text className="text-xs uppercase font-bold text-[#557FB3]">
          VETERINARIAN • {doctorName}
        </Text>
        <Text className="text-3xl font-extrabold text-[#2A4D75] dark:text-white mt-0.5">
          Schedule & Slots
        </Text>
      </View>

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

      <AppCard
        color="bg-white dark:bg-[#1E2733]"
        className="gap-3 border border-slate-200 dark:border-slate-700"
      >
        <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
          Add New Available Slot
        </Text>

        {/* Quick Date Chips */}
        <View className="flex-row flex-wrap gap-1.5 pb-1">
          {[
            { label: "Today", offset: 0 },
            { label: "Tomorrow", offset: 1 },
            { label: "+2 Days", offset: 2 },
            { label: "+3 Days", offset: 3 },
          ].map((c) => {
            const target = formatDate(c.offset);
            const isSelected = dateInput === target.date;
            return (
              <TouchableOpacity
                key={c.label}
                onPress={() => handleSelectQuickDate(c.offset)}
                className={`px-3 py-1.5 rounded-lg border ${
                  isSelected
                    ? "bg-[#2A4D75] border-[#2A4D75]"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {c.label} ({target.day})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Text className="text-[11px] font-semibold text-slate-500 mb-1">Date</Text>
            <TextInput
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-[#2A4D75] dark:text-white"
            />
          </View>
          <View style={{ width: 90 }}>
            <Text className="text-[11px] font-semibold text-slate-500 mb-1">Day</Text>
            <TextInput
              value={dayInput}
              onChangeText={setDayInput}
              placeholder="Day"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-[#2A4D75] dark:text-white"
            />
          </View>
        </View>

        {/* Quick Time Chips */}
        <View className="pt-1">
          <Text className="text-[11px] font-semibold text-slate-500 mb-1">Select or Enter Time</Text>
          <View className="flex-row flex-wrap gap-1.5 mb-2">
            {["09:00", "10:00", "11:30", "14:00", "16:30", "18:00"].map((t) => {
              const isSelected = timeInput === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTimeInput(t)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    isSelected
                      ? "bg-[#EAB642] border-[#EAB642]"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            value={timeInput}
            onChangeText={setTimeInput}
            placeholder="Time (HH:mm, 24h format)"
            placeholderTextColor="#94A3B8"
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-[#2A4D75] dark:text-white"
          />
        </View>

        <TouchableOpacity
          onPress={handleAddSlot}
          disabled={loading}
          className={`py-3 rounded-xl items-center mt-1 ${
            loading ? "bg-slate-400" : "bg-[#EAB642]"
          }`}
        >
          <Text className="text-xs font-extrabold text-white">
            {loading ? "Saving Slot..." : "+ Add & Publish Slot"}
          </Text>
        </TouchableOpacity>
      </AppCard>

      <AppCard
        color="bg-white dark:bg-[#1E2733]"
        className="gap-2.5 border border-slate-200 dark:border-slate-700"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-[#2A4D75] dark:text-white">
            Scheduled Slots ({doctorSlots.length})
          </Text>
          <Text className="text-xs text-[#557FB3] font-semibold">
            Visible to Pet Owners
          </Text>
        </View>

        {doctorSlots.length === 0 ? (
          <Text className="text-xs text-slate-500 py-4 text-center">
            No slots scheduled yet. Add your first slot above.
          </Text>
        ) : (
          doctorSlots.map((slot) => (
            <View
              key={slot.slotId}
              className="flex-row items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <View className="flex-row items-center gap-2.5">
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colorPalette.navyDark}
                />
                <Text className="text-xs font-bold text-[#2A4D75] dark:text-white">
                  {slot.day} • {slot.date} • {slot.time}
                </Text>
              </View>

              <View
                className={`px-2.5 py-1 rounded-full ${
                  slot.status === "available"
                    ? "bg-emerald-100 dark:bg-emerald-900/40"
                    : "bg-[#F6D28B]/50 dark:bg-amber-900/40"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold capitalize ${
                    slot.status === "available"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-800 dark:text-amber-300"
                  }`}
                >
                  {slot.status === "available" ? "متاح (Available)" : "محجوز (Booked)"}
                </Text>
              </View>
            </View>
          ))
        )}
      </AppCard>
    </ScrollView>
  );
}
