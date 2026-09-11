import { IsString, IsOptional, IsInt, IsEnum, Max, Min } from 'class-validator';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum KybStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateTenantConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  vertical?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsEnum(TenantStatus)
  status?: TenantStatus;

  @IsOptional()
  @IsEnum(KybStatus)
  kybStatus?: KybStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  platformFeeRateBps?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxTerminals?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxLocations?: number;

  @IsOptional()
  @IsString()
  defaultGateway?: string;
}
