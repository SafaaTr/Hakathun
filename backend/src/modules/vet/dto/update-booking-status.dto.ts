import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateVetBookingStatusDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsEnum(['approved', 'rejected'])
  status: string;
}
