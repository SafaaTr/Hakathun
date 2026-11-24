import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;

  // Vet & Host fields
  @IsOptional()
  @IsString()
  address?: string;

  // Host caregiver specific fields
  @IsOptional()
  @IsString()
  placeType?: string;

  @IsOptional()
  @IsString()
  acceptedPetType?: string;

  @IsOptional()
  @IsString()
  pricingType?: string;

  @IsOptional()
  @IsNumber()
  dailyPrice?: number;

  @IsOptional()
  @IsString()
  foodCost?: string;
}
