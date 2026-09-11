/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSG-015 -- FDA Tobacco/Age Compliance
 * FILE TYPE:    DTO
 * MODULE:       checkout
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-073
 * GENERATED:    2026-03-17T13:09:27.898Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// This file is part of PaySurity-Platform-2026.
// Copyright (C) 2026, PaySurity. All Rights Reserved.
// POSG-015: FDA Tobacco/Age Compliance - VerifyAge DTO

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsISO8601, IsNotEmpty } from 'class-validator';

export class VerifyAgeDto {
  @ApiProperty({
    description: 'Customer\'s date of birth in YYYY-MM-DD format',
    example: '1990-01-15',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Customer date of birth cannot be empty.' })
  @IsString({ message: 'Customer date of birth must be a string.' })
  @IsISO8601({ strict: true }, { message: 'Customer date of birth must be a valid ISO 8601 date string (YYYY-MM-DD).' })
  customerDateOfBirth: string;
}
