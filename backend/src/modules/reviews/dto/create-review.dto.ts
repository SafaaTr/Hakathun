import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsEnum(['vet_booking', 'host_booking'])
  bookingType: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  bookingId: string;

  @IsNotEmpty({ message: 'Please select a rating.' })
  @IsNumber({}, { message: 'Please select a rating.' })
  @Min(1, { message: 'Please select a rating.' })
  @Max(5, { message: 'Please select a rating.' })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Comment cannot exceed 300 characters.' })
  comment?: string;
}
