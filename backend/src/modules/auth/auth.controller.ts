import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new pet owner (Public registration for pet_owner only)' })
  @ApiResponse({ status: 201, description: 'Account registered successfully' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      message: 'Account registered successfully',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login for all roles (SuperAdmin, Veterinarian, Host Caregiver, Store Owner, Pet Owner)' })
  @ApiResponse({ status: 200, description: 'Logged in successfully' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      message: 'Logged in successfully',
      data: result,
    };
  }
}

@ApiTags('Profile')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @Get('me/profile')
  @ApiOperation({ summary: 'Get current user profile (Role-specific: Pet Owner, Vet, Host, Store)' })
  async getProfile(@CurrentUser('userId') userId: string) {
    const profile = await this.authService.getProfile(userId);
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile (Alias)' })
  async getProfileAlias(@CurrentUser('userId') userId: string) {
    const profile = await this.authService.getProfile(userId);
    return {
      message: 'Profile retrieved successfully',
      data: profile,
    };
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'FR-13: Update profile info for doctor, host caregiver, or pet owner' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.authService.updateProfile(userId, dto);
    return {
      message: result.message,
      data: null,
    };
  }
}
