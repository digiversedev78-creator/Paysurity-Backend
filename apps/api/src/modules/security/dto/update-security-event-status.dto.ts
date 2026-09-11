import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateSecurityEventStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}
