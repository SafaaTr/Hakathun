import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateHostProfileDto {
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
