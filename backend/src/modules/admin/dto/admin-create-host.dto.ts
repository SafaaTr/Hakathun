import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class AdminCreateHostDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @Matches(/^[\u0600-\u06FFa-zA-Z0-9\s.'_-]+$/, {
    message: 'Invalid name, password, or phone number. Please re-enter.',
  })
  name: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @Matches(/^09\d{8}$/, {
    message: 'Invalid name, password, or phone number. Please re-enter.',
  })
  phone: string;

  @IsOptional()
  @MinLength(8, {
    message: 'Invalid name, password, or phone number. Please re-enter.',
  })
  password?: string;

  @IsOptional()
  confirmPassword?: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsEnum(['home', 'barn'])
  placeType: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  acceptedPetType: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsEnum(['free', 'paid'])
  pricingType: string;

  @IsOptional()
  @IsNumber()
  dailyPrice?: number;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  foodCost: string;
}
