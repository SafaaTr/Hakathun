import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HostService } from './host.service';
import { CreateHostBookingDto } from './dto/create-host-booking.dto';
import { CreateHostProfileDto } from './dto/create-host-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Host Caregivers & Bookings')
@Controller()
export class HostController {
  constructor(private readonly hostService: HostService) {}

  @Get('hosts')
  @ApiOperation({ summary: 'List available host caregivers with ratings and filter' })
  async getAllHosts(
    @Query('placeType') placeType?: string,
    @Query('petType') petType?: string,
    @Query('pricingType') pricingType?: string,
  ) {
    return this.hostService.getAllHosts({ placeType, petType, pricingType });
  }

  @Post('hosts/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update host caregiver profile' })
  async createProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateHostProfileDto,
  ) {
    const profile = await this.hostService.createProfile(userId, dto);
    return {
      message: 'Your profile has been updated.',
      data: profile,
    };
  }

  @Post('host-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pet_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a booking with a host caregiver' })
  async createBooking(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateHostBookingDto,
  ) {
    const booking = await this.hostService.createBooking(userId, dto);
    return {
      message: 'Your request has been sent, you will receive a response.',
      data: booking,
    };
  }

  @Get('host-bookings/incoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host_caregiver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List incoming host bookings for the host caregiver' })
  async getIncomingBookings(@CurrentUser('userId') userId: string) {
    return this.hostService.getIncomingBookings(userId);
  }

  @Get('host-bookings/my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pet_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pet owner host bookings' })
  async getMyBookings(@CurrentUser('userId') userId: string) {
    return this.hostService.getMyBookings(userId);
  }

  @Post('host-bookings/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host_caregiver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host approves an incoming booking (POST)' })
  async confirmBookingPost(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const updated = await this.hostService.confirmBooking(userId, id);
    return {
      message: 'Booking confirmed successfully',
      data: updated,
    };
  }

  @Patch('host-bookings/:id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host_caregiver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host approves an incoming booking (PATCH)' })
  async confirmBookingPatch(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const updated = await this.hostService.confirmBooking(userId, id);
    return {
      message: 'Booking confirmed successfully',
      data: updated,
    };
  }

  @Post('host-bookings/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host_caregiver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host rejects an incoming booking (POST)' })
  async rejectBookingPost(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const updated = await this.hostService.rejectBooking(userId, id);
    return {
      message: 'Booking rejected successfully',
      data: updated,
    };
  }

  @Patch('host-bookings/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host_caregiver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Host rejects an incoming booking (PATCH)' })
  async rejectBookingPatch(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const updated = await this.hostService.rejectBooking(userId, id);
    return {
      message: 'Booking rejected successfully',
      data: updated,
    };
  }

  @Patch('host-bookings/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('host_caregiver')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update host booking status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() body: any,
  ) {
    const status = body?.status || body?.decision || 'approved';
    const updated = status === 'approved' 
      ? await this.hostService.confirmBooking(userId, id)
      : await this.hostService.rejectBooking(userId, id);
    return {
      message: `Booking ${status} successfully`,
      data: updated,
    };
  }
}
