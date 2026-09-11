import { IsString, IsNotEmpty } from 'class-validator';

export class AffiliateFraudDetectionDto {
  @IsString()
  @IsNotEmpty()
  affiliateId: string;
}
