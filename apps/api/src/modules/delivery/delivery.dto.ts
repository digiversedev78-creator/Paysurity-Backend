/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-006 -- Delivery Driver Assignment
 * FILE TYPE:    DTO
 * MODULE:       delivery
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/POSR_POS_RESTAURANT.md
 * WORKER:       CODER-052
 * GENERATED:    2026-03-17T13:07:28.257Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsUUID, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AssignDeliveryDriverDto {
  @IsUUID('4', { message: 'driverId must be a valid UUID v4' })
  @IsNotEmpty({ message: 'driverId cannot be empty' })
  driverId: string;

  @IsString({ message: 'tenantId must be a string' })
  @IsNotEmpty({ message: 'tenantId cannot be empty' })
  tenantId: string;

  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId cannot be empty' })
  userId: string;

  @IsString({ message: 'status must be a string' })
  @IsOptional()
  status?: string; // Optional status update, e.g., 'ASSIGNED'
}
