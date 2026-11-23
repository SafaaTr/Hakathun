import { IsString, IsNotEmpty } from 'class-validator';

export class CheckoutDto {
  @IsString({ message: 'Please fill in all fields.' })
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  deliveryAddress: string;
}
