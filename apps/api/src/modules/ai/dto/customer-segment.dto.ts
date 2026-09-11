import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsIn,
  IsObject,
  IsDateString,
  IsEnum,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class CreateCustomerSegmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsNotEmpty()
  criteria: Record<string, any>; // Flexible JSON object for segment definition

  @IsUUID('4')
  @IsNotEmpty()
  organizationId: string;
}

export class UpdateCustomerSegmentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  criteria?: Record<string, any>;
}

export class CustomerSegmentDto {
  @IsUUID('4')
  id: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  criteria: Record<string, any>;

  @IsUUID('4')
  organizationId: string;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsDateString()
  @IsOptional()
  deletedAt?: Date;
}

export class CustomerSegmentFilterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID('4')
  @IsOptional()
  organizationId?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
