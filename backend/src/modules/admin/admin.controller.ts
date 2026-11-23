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
import { AdminService } from './admin.service';
import { AdminCreateDoctorDto } from './dto/admin-create-doctor.dto';
import { AdminCreateHostDto } from './dto/admin-create-host.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin Console')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistical KPIs' })
  async getStats() {
    return this.adminService.getPlatformStats();
  }

  // Doctors
  @Get('doctors')
  @ApiOperation({ summary: 'List all veterinarians with ratings and status' })
  async getDoctors() {
    return this.adminService.getDoctors();
  }

  @Post('doctors')
  @ApiOperation({ summary: 'Super Admin creates a veterinarian account' })
  async createDoctor(@Body() dto: AdminCreateDoctorDto) {
    const doc = await this.adminService.createDoctor(dto);
    return {
      message: 'Veterinarian account created successfully',
      data: doc,
    };
  }

  @Patch('doctors/:id')
  @ApiOperation({ summary: 'Update or soft-deactivate veterinarian (status: unavailable)' })
  async updateDoctor(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const updated = await this.adminService.updateDoctor(id, updateData);
    return {
      message: 'Doctor updated successfully',
      data: updated,
    };
  }

  // Hosts
  @Get('hosts')
  @ApiOperation({ summary: 'List all host caregivers with ratings and status' })
  async getHosts() {
    return this.adminService.getHosts();
  }

  @Post('hosts')
  @ApiOperation({ summary: 'Super Admin creates a host caregiver account' })
  async createHost(@Body() dto: AdminCreateHostDto) {
    const host = await this.adminService.createHost(dto);
    return {
      message: 'Host caregiver account created successfully',
      data: host,
    };
  }

  @Patch('hosts/:id')
  @ApiOperation({ summary: 'Update or soft-deactivate host caregiver (status: unavailable)' })
  async updateHost(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const updated = await this.adminService.updateHost(id, updateData);
    return {
      message: 'Host updated successfully',
      data: updated,
    };
  }

  // Pet Owners (Read-only)
  @Get('pet-owners')
  @ApiOperation({ summary: 'Read-only detailed view of registered pet owners' })
  async getPetOwners() {
    return this.adminService.getPetOwners();
  }

  // Stores
  @Get('stores')
  @ApiOperation({ summary: 'List all stores' })
  async getStores() {
    return this.adminService.getStores();
  }

  @Post('stores')
  @ApiOperation({ summary: 'Create store and assign store_owner' })
  async createStore(@Body() dto: CreateStoreDto) {
    const store = await this.adminService.createStore(dto);
    return {
      message: 'Store created successfully',
      data: store,
    };
  }

  @Patch('stores/:id')
  @ApiOperation({ summary: 'Update store or close (status: closed)' })
  async updateStoreStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    const store = await this.adminService.updateStoreStatus(id, status);
    return {
      message: 'Store status updated successfully',
      data: store,
    };
  }
}
