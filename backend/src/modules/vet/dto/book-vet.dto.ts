import { IsOptional, IsString } from 'class-validator';

export class BookVetDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  externalDoctorId?: string;

  @IsOptional()
  @IsString()
  slotId?: string;

  @IsOptional()
  @IsString()
  externalSlotId?: string;

  @IsOptional()
  @IsString()
  petId?: string;
}
