const segmentationRunStatusEnum: any = {};


import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  // segmentationRunStatusEnum removed
  // NewCustomerSegment, // Not explicitly needed for service methods returning types
} from '@paysurity/database';

import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsUUID,
  IsEnum
} from 'class-validator';

// DTOs for the service methods (internal to this file, not exported unless explicitly asked)
class CreateSegmentationRunDto {
  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>; // Parameters for the AI model
}

class UpdateSegmentationRunDto {
  @IsEnum(segmentationRunStatusEnum.enumValues)
  @IsOptional()
  status?: typeof segmentationRunStatusEnum.enumValues[number];

  @IsObject()
  @IsOptional()
  resultsSummary?: Record<string, any>;

  @IsString()
  @IsOptional()
  startedAt?: string; // ISO string

  @IsString()
  @IsOptional()
  completedAt?: string; // ISO string
}

class ListSegmentationRunsDto {
  @IsEnum(segmentationRunStatusEnum.enumValues)
  @IsOptional()
  status?: typeof segmentationRunStatusEnum.enumValues[number];

  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'status';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

class AddOrRemoveCustomersToSegmentDto {
  @IsArray()
  @IsUUID('4', { each: true })
  customerIds: string[];
}

// This class is explicitly exported by the stub and must be fixed as a DTO.
// Assuming it represents the payload for creating or updating a single customer segment.
export class customerSegments { // Keeping the exact class name as per rules
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  criteria?: Record<string, any>; // AI-defined criteria for the segment

  @IsString() // Can be a numerical string or a descriptive text like "over 1000"
  @IsOptional()
  customerCount?: string;
}

// DTO for the new segmentation results
export class RfmSegmentationResult {
  segmentName: string;
  segmentDescription?: string;
  customerIds: string[];
  customerCount: number;
}


@Injectable()
export class AiCustomerSegmentationService {
  constructor(@Inject('DATABASE') private readonly db: NodePgDatabase<any>) {}
}








