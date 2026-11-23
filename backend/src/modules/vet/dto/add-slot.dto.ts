import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AddSlotDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD.' })
  date: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  day: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Time must be HH:mm.' })
  time: string;
}
