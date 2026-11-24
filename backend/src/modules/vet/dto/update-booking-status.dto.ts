import { IsOptional, IsString } from 'class-validator';

export class UpdateVetBookingStatusDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  decision?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;
}
