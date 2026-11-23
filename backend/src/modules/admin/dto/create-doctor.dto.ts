import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDoctorDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  specialty: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  clinicAddress: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsNumber()
  @Min(0)
  consultationFee: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
