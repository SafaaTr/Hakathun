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
    const updated = await this.vetService.updateAppointmentStatus(doctorId, bookingId, dto.status);
    return {
      message: `Appointment ${dto.status} successfully`,
      data: updated,
    };
  }
}
