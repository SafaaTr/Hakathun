import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Pets')
@Controller('pets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new pet' })
  async createPet(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreatePetDto,
  ) {
    const pet = await this.petsService.createPet(userId, dto);
    return {
      success: true,
      message: 'Pet profile created successfully',
      data: pet,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets owned by the authenticated user' })
  async getMyPets(@CurrentUser('userId') userId: string) {
    const pets = await this.petsService.getMyPets(userId);
    return pets;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pet details by ID' })
  async getPetById(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const pet = await this.petsService.getPetById(id, userId);
    return pet;
  }
}
