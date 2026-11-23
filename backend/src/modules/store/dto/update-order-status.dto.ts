import { IsString, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsIn(['approved', 'rejected'], {
    message: 'Status must be approved or rejected',
  })
  status: string;
}
