import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum, IsUrl, IsObject, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
// mapped-types removed

export enum MerchantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum MerchantCategory {
  RETAIL = 'retail',
  SERVICE = 'service',
  DIGITAL = 'digital',
  FINANCIAL = 'financial',
  GAMING = 'gaming',
  OTHER = 'other',
}

export class CreateMerchantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  addressLine1?: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  stateProvince?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  country: string; // ISO 3166-1 alpha-3 code

  @IsEnum(MerchantStatus)
  @IsOptional()
  status?: MerchantStatus;

  @IsEnum(MerchantCategory)
  @IsOptional()
  category?: MerchantCategory;

  @IsString()
  @IsOptional()
  currency?: string; // ISO 4217 code, e.g., "USD", "EUR"

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateMerchantDto extends (class {} as any) {}

export class MerchantResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  addressLine1?: string;

  @IsString()
  @IsOptional()
  addressLine2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  stateProvince?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  country: string;

  @IsEnum(MerchantStatus)
  status: MerchantStatus;

  @IsEnum(MerchantCategory)
  @IsOptional()
  category?: MerchantCategory;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;
}

export { MerchantCategory as MerchantType }; // Alias for backward compatibility if `MerchantType` was expected to be an enum



