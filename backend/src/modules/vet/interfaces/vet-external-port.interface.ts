export interface ExternalDoctorDto {
  externalDoctorId: string;
  name: string;
  phone: string;
  clinicName: string;
  location: string;
  price: number;
  status: 'available' | 'unavailable';
}

export interface ExternalSlotDto {
  externalSlotId: string;
  date: string; // YYYY-MM-DD
  day: string;  // Today, Tomorrow, Mon, Tue...
  time: string; // HH:mm
  status: 'available' | 'booked';
}

export interface IVetExternalPort {
  getAvailableDoctors(): Promise<ExternalDoctorDto[]>;
  getDoctorSlots(externalDoctorId: string): Promise<ExternalSlotDto[]>;
  createExternalDoctor(payload: any): Promise<{ externalDoctorId: string }>;
  updateExternalDoctor(id: string, payload: any): Promise<boolean>;
  submitAppointmentRequest(dto: any): Promise<boolean>;
}
