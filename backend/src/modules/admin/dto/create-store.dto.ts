import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Please fill in all fields.' })
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
