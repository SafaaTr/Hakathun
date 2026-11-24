import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CheckoutDto {
  @IsString({ message: 'Please fill in all fields.' })
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  deliveryAddress: string;

  @IsOptional()
  @IsArray()
  items?: Array<{
    productId?: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    storeId?: string;
  }>;

  @IsOptional()
  @IsString()
  storeId?: string;
}
