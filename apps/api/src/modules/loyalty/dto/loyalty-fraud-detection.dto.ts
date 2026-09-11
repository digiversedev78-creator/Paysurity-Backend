import { IsString, IsNotEmpty } from 'class-validator';

export class LoyaltyFraudDetectionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
