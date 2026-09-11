/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  POSR-011 -- Tip Management
 * FILE TYPE:    DTO
 * MODULE:       tips
 * PRIORITY:     P0
 * SOURCE:       Requirements/Canonical/GAP_FILL.md
 * WORKER:       CODER-057
 * GENERATED:    2026-03-17T13:07:46.354Z
 * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json
 * ═══════════════════════════════════════════════════════════
 */
// src/tips/dto/tip.dto.ts
import { IsUUID, IsNumber, IsString, IsPositive, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUpdateTipDto {
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most two decimal places.' })
  @IsPositive({ message: 'Amount must be a positive number.' })
  @Type(() => Number)
  amount: number;

  @IsString({ message: 'Currency must be a string.' })
  @Length(3, 3, { message: 'Currency must be a 3-letter ISO code (e.g., USD).' })
  currency: string; // e.g., 'USD', 'EUR', 'JPY'

  @IsString({ message: 'Method must be a string.' })
  @Length(1, 50, { message: 'Method must be between 1 and 50 characters.' })
  method: string; // e.g., 'card', 'cash', 'gift_card'
}

export class TipResponseDto {
  @IsUUID('4', { message: 'Tip ID must be a valid UUID v4.' })
  id: string;

  @IsUUID('4', { message: 'Order ID must be a valid UUID v4.' })
  orderId: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount must be a number with at most two decimal places.' })
  amount: number;

  @IsString({ message: 'Currency must be a string.' })
  currency: string;

  @IsString({ message: 'Method must be a string.' })
  method: string;

  createdAt: Date;
  updatedAt: Date;
}
