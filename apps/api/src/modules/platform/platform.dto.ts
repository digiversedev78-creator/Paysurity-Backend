/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  NFR-006 — Multi-Region Failover
 * FILE TYPE:    DTO
 * MODULE:       platform
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/NFR_PLATFORM_NONFUNCTIONAL.md
 * WORKER:       CODER-178
 * GENERATED:    2026-03-18T10:39:14.870Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
// Traceability: NFR-006 Multi-Region Failover, Module: platform, Priority: P1, Entity: platform
// File: platform-config.dto.ts

import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new platform configuration.
 */
export class CreatePlatformConfigDto {
  @ApiProperty({ description: 'Unique key for the platform configuration (e.g., MAINTENANCE_MODE_ENABLED).' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  key: string;

  @ApiProperty({ description: 'Value associated with the configuration key.' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Description of the configuration item.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Indicates if this configuration is specific to a particular region.' })
  @IsBoolean()
  @IsOptional()
  isRegionSpecific?: boolean;

  @ApiPropertyOptional({ description: 'The name of the region if isRegionSpecific is true (e.g., us-east-1).' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  regionName?: string;
}

/**
 * DTO for updating an existing platform configuration.
 */
export class UpdatePlatformConfigDto {
  @ApiPropertyOptional({ description: 'New unique key for the platform configuration.' })
  @IsString()
  @IsOptional()
  @MaxLength(256)
  key?: string;

  @ApiPropertyOptional({ description: 'New value for the configuration key.' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({ description: 'New description of the configuration item.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'New indicator if this configuration is specific to a particular region.' })
  @IsBoolean()
  @IsOptional()
  isRegionSpecific?: boolean;

  @ApiPropertyOptional({ description: 'New name of the region if isRegionSpecific is true.' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  regionName?: string;
}

/**
 * DTO for representing a platform configuration response.
 */
export class PlatformConfigDto {
  @ApiProperty({ description: 'Unique identifier of the platform configuration.' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Unique identifier of the tenant this configuration belongs to.' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Unique key for the platform configuration.' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Value associated with the configuration key.' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Description of the configuration item.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Indicates if this configuration is specific to a particular region.' })
  @IsBoolean()
  isRegionSpecific: boolean;

  @ApiPropertyOptional({ description: 'The name of the region if isRegionSpecific is true.' })
  @IsString()
  @IsOptional()
  regionName?: string;

  @ApiProperty({ description: 'Timestamp when the configuration was created.' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the configuration was last updated.' })
  updatedAt: Date;
}
