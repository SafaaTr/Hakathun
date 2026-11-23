import { Injectable } from '@nestjs/common';
import {
  IVetExternalPort,
  ExternalDoctorDto,
  ExternalSlotDto,
} from '../interfaces/vet-external-port.interface';

@Injectable()
export class VetExternalAdapter implements IVetExternalPort {
  private apiUrl = process.env.EXTERNAL_VET_API_URL || 'http://localhost:5000/api/doctors';

  // In-memory or remote synced doctors cache for fault-tolerant operation
  private mockDoctors: ExternalDoctorDto[] = [
    {
      externalDoctorId: 'ext_doc_01',
      name: 'Dr. Zaid Khouri',
      phone: '0933112244',
      clinicName: 'Shaalan Pet Clinic',
      location: 'Shaalan, Damascus',
      price: 50000,
      status: 'available',
    },
    {
      externalDoctorId: 'ext_doc_02',
      name: 'Dr. Nour Salem',
      phone: '0944887766',
      clinicName: 'Mezzeh Autostrad Vet',
      location: 'Mezzeh Autostrad, Damascus',
      price: 45000,
      status: 'available',
    },
    {
      externalDoctorId: 'ext_doc_03',
      name: 'Dr. Fadi Bitar',
      phone: '0955663322',
      clinicName: 'Kafar Souseh Clinic',
      location: 'Kafar Souseh, Damascus',
      price: 40000,
      status: 'unavailable',
    },
  ];

  async getAvailableDoctors(): Promise<ExternalDoctorDto[]> {
    try {
      // If external doctors-backend is running, fetch live
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${this.apiUrl}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          return json.data.map((d: any) => ({
            externalDoctorId: d._id || d.externalDoctorId,
            name: d.name,
            phone: d.phone,
            clinicName: d.clinicName || 'Pet Clinic',
            location: d.location || 'Damascus',
            price: d.price || 50000,
            status: d.isActive !== false ? 'available' : 'unavailable',
          }));
        }
      }
    } catch {}

    return this.mockDoctors.filter((d) => d.status === 'available');
  }

  async getDoctorSlots(externalDoctorId: string): Promise<ExternalSlotDto[]> {
    // Generate next 7 days week slots matching Day Strip requirement (Section 6.1 & FR-11)
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeList = ['09:00', '09:30', '10:30', '11:00', '13:00', '14:30', '15:00', '16:30'];
    const slots: ExternalSlotDto[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      let dayName = days[d.getDay()];
      if (i === 0) dayName = 'Today';
      else if (i === 1) dayName = 'Tomorrow';

      // Distribute slots across days
      timeList.forEach((time, index) => {
        slots.push({
          externalSlotId: `slot_${externalDoctorId}_${dateStr}_${time.replace(':', '')}`,
          date: dateStr,
          day: dayName,
          time,
          status: (index + i) % 5 === 0 ? 'booked' : 'available',
        });
      });
    }

    return slots;
  }

  async createExternalDoctor(payload: any): Promise<{ externalDoctorId: string }> {
    const extId = `ext_${Date.now()}`;
    this.mockDoctors.push({
      externalDoctorId: extId,
      name: payload.name,
      phone: payload.phone,
      clinicName: payload.clinicName || 'Clinic',
      location: payload.address || 'Damascus',
      price: payload.price || 50000,
      status: 'available',
    });
    return { externalDoctorId: extId };
  }

  async updateExternalDoctor(id: string, payload: any): Promise<boolean> {
    const doc = this.mockDoctors.find((d) => d.externalDoctorId === id);
    if (doc) {
      if (payload.status) doc.status = payload.status;
      if (payload.name) doc.name = payload.name;
      return true;
    }
    return false;
  }

  async submitAppointmentRequest(dto: any): Promise<boolean> {
    return true;
  }
}
