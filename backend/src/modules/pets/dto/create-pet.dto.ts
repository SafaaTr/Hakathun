import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  petType: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsNumber()
  @Min(0)
  age: number;

  @IsOptional()
  @IsString()
  vaccinationRecordUrl?: string;

  @IsOptional()
  @IsString()
  lastVetVisitDate?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
