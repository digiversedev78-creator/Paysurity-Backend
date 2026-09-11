import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type NexusType = 'PHYSICAL' | 'ECONOMIC' | 'AFFILIATE' | 'CLICK_THROUGH';

export class CreateTaxNexusDto {
  @ApiProperty({ example: 'CA' }) @IsString() @IsNotEmpty() stateCode!: string;
  @ApiProperty({ enum: ['PHYSICAL', 'ECONOMIC', 'AFFILIATE', 'CLICK_THROUGH'] })
  @IsIn(['PHYSICAL', 'ECONOMIC', 'AFFILIATE', 'CLICK_THROUGH']) nexusType!: NexusType;
  @ApiProperty({ example: '2026-01-01' }) @IsDateString() effectiveDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateTaxNexusDto {
  @ApiPropertyOptional({ example: 'NY' }) @IsOptional() @IsString() stateCode?: string;
  @ApiPropertyOptional({ enum: ['PHYSICAL', 'ECONOMIC', 'AFFILIATE', 'CLICK_THROUGH'] })
  @IsOptional() @IsIn(['PHYSICAL', 'ECONOMIC', 'AFFILIATE', 'CLICK_THROUGH']) nexusType?: NexusType;
  @ApiPropertyOptional({ example: '2026-06-01' }) @IsOptional() @IsDateString() effectiveDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
