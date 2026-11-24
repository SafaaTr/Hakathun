// src/services/rafeeqService.ts
import { fetchApi } from "./apiClient";

export type BookingStatus = "pending" | "approved" | "rejected";

export interface Doctor {
  externalDoctorId: string;
  name: string;
  phone: string;
  address: string;
  clinicName?: string;
  consultationPrice?: number;
  avgRating: number;
  ratingsCount: number;
}

export interface ExternalSlotDto {
  externalSlotId: string;
  date: string;
  day: string;
  time: string;
  status: "available" | "booked";
}

export interface VetAppointmentBooking {
  _id: string;
  referenceCode: string;
  externalDoctorId: string;
  externalSlotId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentDay: string;  // Mon, Tue, ...
  appointmentTime: string; // HH:mm
  status: BookingStatus;
  customerName: string;
  customerPhone?: string;
  petSummary: string; // e.g.: Cat • Luna (2y)
}

export interface VetDoctorAccount {
  externalDoctorId: string;
  name: string;
  phone: string;
  address: string;
  clinicName?: string;
  consultationPrice?: number;
  status: "active" | "unavailable";
  avgRating: number;
  ratingsCount: number;
  bio?: string;
  specialization?: string;
}

export async function getDoctors(): Promise<Doctor[]> {
  const result = await fetchApi<any>("/doctors", { method: "GET" }, async () => [
    {
      externalDoctorId: "6b044cd63434d71f2873d49f",
      name: "Dr. Zaid Khouri",
      phone: "0933112244",
      address: "Shaalan Pet Clinic, Damascus",
      clinicName: "Shaalan Pet Clinic",
      consultationPrice: 35000,
      avgRating: 5.0,
      ratingsCount: 5,
    },
    {
      externalDoctorId: "vet_101",
      name: "Dr. Leen Khalil",
      phone: "0933111222",
      address: "Damascus - Al-Malki",
      clinicName: "Happy Paws Clinic",
      consultationPrice: 50000,
      avgRating: 4.8,
      ratingsCount: 23,
    },
  ]);

  const rawList = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
  return rawList.map((d: any) => ({
    id: d.id || d.doctorId || d.externalDoctorId,
    doctorId: d.id || d.doctorId || d.externalDoctorId,
    externalDoctorId: d.id || d.doctorId || d.externalDoctorId,
    name: d.name,
    phone: d.phone,
    address: d.address,
    clinicName: d.clinicName || "Pet Clinic",
    consultationPrice: d.consultationPrice || 35000,
    avgRating: typeof d.avgRating === "number" ? d.avgRating : 5.0,
    ratingsCount: typeof d.ratingsCount === "number" ? d.ratingsCount : 0,
    status: d.status || "available",
  }));
}

export async function getDoctorSlots(externalDoctorId: string): Promise<ExternalSlotDto[]> {
  return fetchApi(`/doctors/${externalDoctorId}/slots`, { method: "GET" }, async () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const slots: ExternalSlotDto[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      for (const time of ["09:00", "11:30", "14:00", "16:30"]) {
        slots.push({
          externalSlotId: `slot_${externalDoctorId}_${dateStr}_${time}`,
          date: dateStr,
          day: days[date.getDay()],
          time,
          status: "available",
        });
      }
    }

    return slots;
  });
}

export async function bookVetAppointment(payload: {
  externalDoctorId: string;
  externalSlotId: string;
  petId: string;
}): Promise<{ referenceCode: string; status: BookingStatus }> {
  return fetchApi(
    "/bookings-vet",
    {
      method: "POST",
      body: JSON.stringify({
        doctorId: payload.externalDoctorId,
        slotId: payload.externalSlotId,
        petId: payload.petId,
      }),
    },
    async () => ({ referenceCode: `VET-${Date.now().toString().slice(-5)}`, status: "pending" })
  );
}

export async function submitRating(payload: {
  bookingId: string;
  bookingType: "vet_booking" | "host_booking";
  rating: number;
  comment: string;
}): Promise<{ bookingId: string; rating: number }> {
  return fetchApi(
    "/ratings",
    { method: "POST", body: JSON.stringify(payload) },
    async () => ({ bookingId: payload.bookingId, rating: payload.rating })
  );
}

// Fetch doctor profile and bookings
export async function getVetAppointmentsAndProfile(externalDoctorId: string): Promise<{
  doctor: VetDoctorAccount;
  bookings: VetAppointmentBooking[];
  slots: ExternalSlotDto[];
}> {
  return fetchApi(
    `/vet-portal/${externalDoctorId}/dashboard`,
    { method: "GET" },
    async () => {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      return {
        doctor: {
          externalDoctorId,
          name: "Dr. Leen Khalil",
          phone: "0933111222",
          address: "Damascus - Al-Malki",
          clinicName: "Happy Paws Clinic",
          consultationPrice: 50000,
          status: "active",
          avgRating: 4.8,
          ratingsCount: 23,
        },
        bookings: [
          {
            _id: "vb_101",
            referenceCode: "VET-40219",
            externalDoctorId,
            externalSlotId: "slot_0_1",
            appointmentDate: todayStr,
            appointmentDay: days[today.getDay()],
            appointmentTime: "10:30",
            status: "pending",
            customerName: "Maya Haddad",
            customerPhone: "0944123456",
            petSummary: "Cat • Luna (2y)",
          },
          {
            _id: "vb_102",
            referenceCode: "VET-40220",
            externalDoctorId,
            externalSlotId: "slot_0_2",
            appointmentDate: todayStr,
            appointmentDay: days[today.getDay()],
            appointmentTime: "13:00",
            status: "approved",
            customerName: "Rami Al-Ahmad",
            customerPhone: "0955654321",
            petSummary: "Dog • Max (3y)",
          },
        ],
        slots: [
          {
            externalSlotId: "slot_0_1",
            date: todayStr,
            day: days[today.getDay()],
            time: "10:30",
            status: "booked",
          },
          {
            externalSlotId: "slot_0_2",
            date: todayStr,
            day: days[today.getDay()],
            time: "13:00",
            status: "booked",
          },
          {
            externalSlotId: "slot_0_3",
            date: todayStr,
            day: days[today.getDay()],
            time: "15:00",
            status: "available",
          },
        ],
      };
    }
  );
}

// Confirm or reject booking from doctor app (updates status to approved or rejected)
export async function updateVetBookingDecision(payload: {
  bookingId: string;
  decision: "approved" | "rejected";
}): Promise<{ bookingId: string; status: BookingStatus }> {
  return fetchApi(
    `/webhooks/vet-booking-status`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    async () => ({
      bookingId: payload.bookingId,
      status: payload.decision,
    })
  );
}

// Update doctor profile information
export async function updateVetProfileInfo(payload: {
  externalDoctorId: string;
  name: string;
  phone: string;
  address: string;
  clinicName?: string;
  consultationPrice?: number;
  bio?: string;
  specialization?: string;
}): Promise<VetDoctorAccount> {
  await fetchApi(
    `/me/profile`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    async () => ({ success: true })
  );

  return {
    externalDoctorId: payload.externalDoctorId,
    name: payload.name,
    phone: payload.phone,
    address: payload.address,
    clinicName: payload.clinicName,
    consultationPrice: payload.consultationPrice,
    specialization: payload.specialization,
    bio: payload.bio,
    status: "active",
    avgRating: 5.0,
    ratingsCount: 5,
  };
}

// Save/add weekly doctor schedule slots (ExternalSlotDto[])
export async function saveVetWeeklySlots(payload: {
  externalDoctorId: string;
  slots: ExternalSlotDto[];
}): Promise<ExternalSlotDto[]> {
  return fetchApi(
    `/doctors/${payload.externalDoctorId}/slots`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    async () => payload.slots
  );
}