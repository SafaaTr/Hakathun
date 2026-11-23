import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHostBookingDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  hostUserId: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  petId: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  startDate: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  foodNotes?: string;
}
