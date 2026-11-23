import {
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Please fill in all fields.' })
  @Matches(/^[\u0600-\u06FFa-zA-Z\s.]+$/, {
    message: 'Invalid name, password, or phone number. Please re-enter.',
  })
  name: string;

  @IsString({ message: 'Please fill in all fields.' })
  @Matches(/^09\d{8}$/, {
    message: 'Invalid name, password, or phone number. Please re-enter.',
  })
  phone: string;

  @IsString({ message: 'Please fill in all fields.' })
  @MinLength(8, {
    message: 'Invalid name, password, or phone number. Please re-enter.',
  })
  password: string;

  @IsString({ message: 'Please fill in all fields.' })
  confirmPassword: string;
}
