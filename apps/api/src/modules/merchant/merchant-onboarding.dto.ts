/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  MER-004 -- Auto-Provision on Approval
 * FILE TYPE:    DTO
 * MODULE:       merchant-onboarding
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/MER_MERCHANT_SERVICES_ONBOARDING.md
 * WORKER:       CODER-112
 * GENERATED:    2026-03-17T13:11:31.759Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ApproveOnboardingApplicationDto {
  @IsUUID(4, { message: 'Reviewer ID must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'Reviewer ID is required.' })
  reviewerId: string;

  @IsString({ message: 'Approval notes must be a string.' })
  @IsOptional()
  approvalNotes?: string;
}
