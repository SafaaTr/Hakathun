import { IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Please fill in all fields.' })
  name: string;

  @IsString({ message: 'Please fill in all fields.' })
  details: string;

  @IsNumber({}, { message: 'Please enter a valid price in SYP.' })
  @Min(1, { message: 'Please enter a valid price in SYP.' })
  price: number;

  @IsString({ message: 'Please fill in all fields.' })
  imageUrl: string;
}
