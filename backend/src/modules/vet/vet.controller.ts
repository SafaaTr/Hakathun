import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VetService } from './vet.service';
import { AddSlotDto } from './dto/add-slot.dto';
import { BookVetDto } from './dto/book-vet.dto';
import { UpdateVetBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Veterinarians & Clinic Appointments')
@Controller()
export class VetController {
  constructor(private readonly vetService: VetService) {}

  @Get('doctors')
  @ApiOperation({ summary: 'List available veterinarians with rating summary and address' })
  async getAvailableDoctors() {
    return this.vetService.getAvailableDoctors();
  }

  @Get('doctors/:doctorId/slots')
  @ApiOperation({ summary: 'Get weekly available appointment slots (SlotDto[]) for selected doctor' })
  async getDoctorSlots(@Param('doctorId') doctorId: string) {
    return this.vetService.getDoctorSlots(doctorId);
  }

  @Post('doctors/:doctorId/slots')
  @ApiOperation({ summary: 'Save doctor available slots' })
  async addDoctorSlots(
    @Param('doctorId') doctorId: string,
    @Body() body: any,
  ) {
    const rawSlots = Array.isArray(body?.slots) ? body.slots : [body];
    const created = [];
    for (const s of rawSlots) {
      if (s.date && s.day && s.time) {
        const slot = await this.vetService.addSlot(doctorId, {
          date: s.date,
          day: s.day,
          time: s.time,
        });
        created.push(slot);
      }
    }
    return {
      message: 'Slots updated successfully',
      data: created,
    };
  }

  @Post('slots/vet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('veterinarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Veterinarian adds a new weekly available slot' })
  async addSlot(
    @CurrentUser('userId') doctorId: string,
    @Body() dto: AddSlotDto,
  ) {
    const slot = await this.vetService.addSlot(doctorId, dto);
    return {
      message: 'Slot added successfully',
      data: slot,
    };
  }

  @Get('appointments/vet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('veterinarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Veterinarian views incoming appointments with customer & pet snapshot' })
  async getMyAppointments(@CurrentUser('userId') doctorId: string) {
    return this.vetService.getMyAppointments(doctorId);
  }

  @Get('vet-portal/:doctorId/dashboard')
  @ApiOperation({ summary: 'Vet dashboard alias for mobile portal' })
  async getVetPortalDashboard(@Param('doctorId') doctorId: string) {
    const [doctors, slots, bookings] = await Promise.all([
      this.vetService.getAvailableDoctors(),
      this.vetService.getDoctorSlots(doctorId),
      this.vetService.getMyAppointments(doctorId),
    ]);
    const doctor = doctors.find((d) => d.id === doctorId || d.doctorId === doctorId) || doctors[0] || {
      id: doctorId,
      name: 'Dr. Zaid Khouri',
      phone: '0933112244',
      address: 'Shaalan Pet Clinic, Damascus',
      clinicName: 'Shaalan Pet Clinic',
      consultationPrice: 35000,
      status: 'available',
    };
    return {
      doctor,
      slots,
      bookings,
    };
  }

  @Post('bookings-vet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pet_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pet owner requests a clinic booking' })
  async bookAppointment(
    @CurrentUser('userId') customerId: string,
    @Body() dto: BookVetDto,
  ) {
    const booking = await this.vetService.bookAppointment(customerId, dto);
    return {
      message: 'Your request has been sent, you will receive a response.',
      data: booking,
    };
  }

  @Post('vet-bookings')
  @ApiOperation({ summary: 'Alias for clinic booking' })
  async bookAppointmentAlias(
    @CurrentUser('userId') customerId: string,
    @Body() dto: BookVetDto,
  ) {
    const fallbackUserId = customerId || '6b0438064e9594edc2d01203';
    const booking = await this.vetService.bookAppointment(fallbackUserId, dto);
    return {
      message: 'Your request has been sent, you will receive a response.',
      data: booking,
    };
  }

  @Patch('bookings-vet/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('veterinarian')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Veterinarian approves or rejects an incoming appointment' })
  async updateAppointmentStatus(
    @Param('id') bookingId: string,
    @CurrentUser('userId') doctorId: string,
    @Body() dto: UpdateVetBookingStatusDto,
  ) {
    const status = dto.status || dto.decision || 'approved';
    const updated = await this.vetService.updateAppointmentStatus(doctorId, bookingId, status);
    return {
      message: `Appointment ${status} successfully`,
      data: updated,
    };
  }

  @Patch('vet-bookings/:id/status')
  @ApiOperation({ summary: 'Alias for updating appointment status' })
  async updateAppointmentStatusAlias(
    @Param('id') bookingId: string,
    @Body() dto: UpdateVetBookingStatusDto,
  ) {
    const status = dto.status || dto.decision || 'approved';
    const updated = await this.vetService.updateAppointmentStatus('', bookingId, status);
    return {
      message: `Appointment ${status} successfully`,
      data: updated,
    };
  }

  @Post('webhooks/vet-booking-status')
  @ApiOperation({ summary: 'Webhook endpoint for updating appointment status' })
  async webhookVetBookingStatus(@Body() body: any) {
    const bookingId = body.bookingId || body.id;
    const status = body.status || body.decision || 'approved';
    const updated = await this.vetService.updateAppointmentStatus('', bookingId, status);
    return {
      message: `Appointment ${status} successfully`,
      data: updated,
    };
  }
}
