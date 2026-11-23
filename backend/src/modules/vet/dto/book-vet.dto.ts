import { IsNotEmpty, IsString } from 'class-validator';

export class BookVetDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  doctorId: string;

  @IsNotEmpty({ message: 'Please select a time slot.' })
  @IsString()
  slotId: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  petId: string;
}
