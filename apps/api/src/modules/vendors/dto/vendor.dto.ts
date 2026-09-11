import { IsString, IsNotEmpty, IsEmail, IsOptional, IsObject, IsEnum, IsInt, Min, IsIn, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  BLACKLISTED = 'BLACKLISTED',
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactPerson?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  contactEmail: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  zipCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxId?: string; // e.g., VAT number, EIN

  @IsString()
  @IsOptional()
  @MaxLength(255)
  bankAccountName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  bankAccountNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  bankSwiftCode?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;
}

export class VendorQueryDto {
  @IsString()
  @IsOptional()
  search?: string; // General search term

  @IsString()
  @IsOptional()
  name?: string; // Partial match for vendor name

  @IsEmail()
  @IsOptional()
  contactEmail?: string; // Exact match for contact email

  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit? = 10;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  offset? = 0;

  @IsString()
  @IsIn(['name', 'contactPerson', 'contactEmail', 'createdAt', 'updatedAt', 'status'])
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
