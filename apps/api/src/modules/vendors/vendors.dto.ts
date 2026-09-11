/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-013 -- Vendor Management
 * FILE TYPE:    DTO
 * MODULE:       vendors
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSG_POS_GROCERY.md
 * WORKER:       CODER-071
 * GENERATED:    2026-03-17T13:08:22.228Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsString, IsOptional, IsEnum, IsUrl, IsPhoneNumber, Length, IsInt, Min, Max, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export class CreateVendorDto {
  @IsString()
  @Length(2, 255)
  name: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 255)
  email?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Must be a valid phone number' }) // 'ZZ' for generic international phone numbers
  @Length(5, 50)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  zipCode?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsUrl({ require_tld: true }, { message: 'Must be a valid URL' })
  @Length(5, 255)
  website?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000) // Allow empty string or up to 1000 characters
  notes?: string;
}

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  @Length(5, 255)
  email?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Must be a valid phone number' })
  @Length(5, 50)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  zipCode?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsUrl({ require_tld: true }, { message: 'Must be a valid URL' })
  @Length(5, 255)
  website?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

export class VendorQueryDto {
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
