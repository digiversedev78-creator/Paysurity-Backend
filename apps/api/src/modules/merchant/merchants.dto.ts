import { IsString, IsOptional, IsEnum, Length, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export class CreateMerchantDto {
  @ApiProperty({ description: 'The name of the merchant.', minLength: 1, maxLength: 256 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 256)
  name: string;

  @ApiPropertyOptional({ description: 'The tax ID of the merchant (EIN format XX-XXXXXXX).' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}-\d{7}$/, { message: 'taxId must be in format XX-XXXXXXX' })
  taxId?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.DRAFT, description: 'Application status.' })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}

export class UpdateMerchantDto {
  @ApiPropertyOptional({ description: 'The updated name of the merchant.', minLength: 1, maxLength: 256 })
  @IsString()
  @IsOptional()
  @Length(1, 256)
  name?: string;

  @ApiPropertyOptional({ description: 'The tax ID of the merchant (EIN format XX-XXXXXXX).' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{2}-\d{7}$/, { message: 'taxId must be in format XX-XXXXXXX' })
  taxId?: string;

  @ApiPropertyOptional({ enum: ApplicationStatus, description: 'Application status.' })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;
}

export class MerchantResponseDto {
  @ApiProperty({ description: 'The unique identifier of the merchant.', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'The tenant ID this merchant belongs to.', format: 'uuid' })
  tenantId: string;

  @ApiProperty({ description: 'The name of the merchant.' })
  name: string;

  @ApiPropertyOptional({ description: 'The tax ID.' })
  taxId?: string | null;

  @ApiProperty({ enum: ApplicationStatus, description: 'The current status.' })
  status: ApplicationStatus;

  @ApiProperty({ description: 'The timestamp when the merchant was created.' })
  createdAt: Date;

  @ApiProperty({ description: 'The timestamp when the merchant was last updated.' })
  updatedAt: Date;
}
