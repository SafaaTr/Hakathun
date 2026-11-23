import { IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'Please fill in all fields.' })
  name: string;

  @IsString({ message: 'Please fill in all fields.' })
  password: string;
}
