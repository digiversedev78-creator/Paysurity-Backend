/**
 * ═══════════════════════════════════════════════════════════
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  FAC-002 — Upfront Escrow Deposit, FAC_FREIGHT_LOAD_FACTORING — Freight Load Factoring
 * FILE TYPE:    DTO
 * MODULE:       pay-factor
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/FAC_FREIGHT_LOAD_FACTORING.md, Requirements/Canonical/FAC-002.md
 * WORKER:       CODER-223
 * GENERATED:    2026-03-18T10:40:32.002Z
 * MODIFIED:     2024-07-30T10:00:00.000Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * ═══════════════════════════════════════════════════════════
 */
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateIf,
  Max,
  IsArray,
  ArrayMinSize,
  IsDateString,
  ValidateNested,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer'; // Required for @ValidateNested
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

/**
 * Defines how a specific numeric value (like an escrow amount or fee) is calculated.
 * This can be a percentage of a larger amount or a fixed value.
 */
export enum FactorValueCalculationType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

/**
 * Defines the overall type of factoring product or service.
 * This allows for different configurations and business logic based on the product.
 */
export enum FactorProductType {
  UPFRONT_ESCROW = 'upfront_escrow',
  FREIGHT_LOAD_FACTORING = 'freight_load_factoring',
  // Add other factoring product types as needed
}

/**
 * DTO for creating a new Pay Factor configuration.
 * A Pay Factor defines a set of rules for a specific financial product,
 * such as an upfront escrow deposit or freight load factoring.
 */
export class CreatePayFactorDto {
  @ApiProperty({ description: 'The name of the pay factor.', example: 'Standard Escrow Factor' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 256)
  name: string;

  @ApiPropertyOptional({ description: 'A detailed description of the pay factor.', example: 'Applies a 10% upfront escrow.' })
  @IsOptional()
  @IsString()
  @Length(0, 512)
  description?: string;

  @ApiPropertyOptional({ description: 'Indicates if the pay factor is currently active.', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'The type of the factoring product being created.', enum: FactorProductType, example: FactorProductType.FREIGHT_LOAD_FACTORING })
  @IsEnum(FactorProductType)
  @IsNotEmpty()
  factorProductType: FactorProductType;

  // ═══════════════════════════════════════════════════════════
  // FIELDS FOR UPFRONT_ESCROW FACTOR PRODUCT TYPE
  // These fields are relevant when factorProductType is UPFRONT_ESCROW.
  // ═══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'Whether an upfront escrow deposit is required for this pay factor product. Required if factorProductType is UPFRONT_ESCROW.',
    example: true,
  })
  @ValidateIf((o) => o.factorProductType === FactorProductType.UPFRONT_ESCROW)
  @IsBoolean()
  @IsNotEmpty()
  isUpfrontEscrowRequired?: boolean;

  @ApiPropertyOptional({
    description: 'The method used to calculate the upfront escrow value (percentage or fixed). Required if isUpfrontEscrowRequired is true.',
    enum: FactorValueCalculationType,
    example: FactorValueCalculationType.PERCENTAGE,
  })
  @ValidateIf((o) => o.factorProductType === FactorProductType.UPFRONT_ESCROW && o.isUpfrontEscrowRequired === true)
  @IsEnum(FactorValueCalculationType)
  @IsNotEmpty()
  upfrontEscrowCalculationType?: FactorValueCalculationType;

  @ApiPropertyOptional({
    description: 'The value for the upfront escrow. If calculationType is PERCENTAGE, this is a decimal (e.g., 0.10 for 10%). If FIXED, this is the amount in cents. Required if isUpfrontEscrowRequired is true.',
    example: 0.10,
    type: Number,
  })
  @ValidateIf((o) => o.factorProductType === FactorProductType.UPFRONT_ESCROW && o.isUpfrontEscrowRequired === true)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  upfrontEscrowValue?: number;

  @ApiPropertyOptional({
    description: 'Minimum upfront escrow amount in cents. Only applicable if upfrontEscrowCalculationType is PERCENTAGE.',
    example: 10000, // $100.00
  })
  @ValidateIf(
    (o) =>
      o.factorProductType === FactorProductType.UPFRONT_ESCROW &&
      o.isUpfrontEscrowRequired === true &&
      o.upfrontEscrowCalculationType === FactorValueCalculationType.PERCENTAGE,
  )
  @IsNumber()
  @IsOptional()
  @Min(0)
  upfrontEscrowMinCents?: number;

  @ApiPropertyOptional({
    description: 'Maximum upfront escrow amount in cents. Only applicable if upfrontEscrowCalculationType is PERCENTAGE.',
    example: 50000, // $500.00
  })
  @ValidateIf(
    (o) =>
      o.factorProductType === FactorProductType.UPFRONT_ESCROW &&
      o.isUpfrontEscrowRequired === true &&
      o.upfrontEscrowCalculationType === FactorValueCalculationType.PERCENTAGE,
  )
  @IsNumber()
  @IsOptional()
  @Min(0)
  upfrontEscrowMaxCents?: number;

  // ═══════════════════════════════════════════════════════════
  // FIELDS FOR FREIGHT_LOAD_FACTORING FACTOR PRODUCT TYPE
  // These fields are relevant when factorProductType is FREIGHT_LOAD_FACTORING.
  // ═══════════════════════════════════════════════════════════

  @ApiPropertyOptional({
    description: 'The percentage of the load value that is advanced to the driver. Only applicable if factorProductType is FREIGHT_LOAD_FACTORING.',
    example: 0.90, // 90% advance
  })
  @ValidateIf((o) => o.factorProductType === FactorProductType.FREIGHT_LOAD_FACTORING)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1) // Advance rate should be between 0 and 1 (0% to 100%)
  advanceRate?: number;

  @ApiPropertyOptional({
    description: 'The fee percentage charged for factoring the load. Only applicable if factorProductType is FREIGHT_LOAD_FACTORING.',
    example: 0.03, // 3% fee
  })
  @ValidateIf((o) => o.factorProductType === FactorProductType.FREIGHT_LOAD_FACTORING)
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1) // Fee rate should be between 0 and 1 (0% to 100%)
  factoringFeeRate?: number;

  @ApiPropertyOptional({
    description: 'Maximum amount in cents that can be factored for a single load. Only applicable if factorProductType is FREIGHT_LOAD_FACTORING.',
    example: 1000000, // $10,000.00
  })
  @ValidateIf((o) => o.factorProductType === FactorProductType.FREIGHT_LOAD_FACTORING)
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxLoadValueCents?: number;
}

/**
 * DTO for updating an existing Pay Factor configuration.
 */
export class UpdatePayFactorDto extends PartialType(CreatePayFactorDto) {}


/**
 * DTO for a driver applying for a pay factor product.
 * This captures essential driver and banking information required for factoring services.
 */
export class PayFactorApplyDto {
  @ApiProperty({ description: 'The unique identifier of the driver applying for factoring.', format: 'uuid', example: 'd1e4e7b8-f1a2-4c3d-9e0a-1b2c3d4e5f6a' })
  @IsUUID()
  @IsNotEmpty()
  driverId: string;

  @ApiProperty({ description: 'The driver\'s license number.', example: 'DL1234567' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  licenseNumber: string;

  @ApiProperty({ description: 'The last 4 digits of the driver\'s bank account.', example: '1234' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'Bank account last 4 digits must be exactly 4 digits.' })
  bankAccountLast4: string;

  @ApiProperty({ description: 'The driver\'s bank routing number (ABA).', example: '012345678' })
  @IsString()
  @IsNotEmpty()
  @Length(9, 9)
  @Matches(/^\d{9}$/, { message: 'Bank routing number must be exactly 9 digits.' })
  bankRoutingNumber: string;

  @ApiProperty({ description: 'Indicates if the driver has signed the necessary consent forms for pay factoring.', example: true })
  @IsBoolean()
  @IsNotEmpty()
  consentSigned: boolean;
}

/**
 * DTO for initiating an escrow deposit for a driver's load.
 * This typically happens before the final settlement is due.
 */
export class PayFactorEscrowDto {
  @ApiProperty({ description: 'The net amount in cents that the driver is expected to receive for the load, before factoring. This is the basis for escrow calculation.', example: 100000 }) // $1000.00
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  driverNetCents: number;

  @ApiProperty({ description: 'The unique identifier of the AELS (Asset & Equipment Lifecycle System) load associated with this escrow request.', format: 'uuid', example: 'a0b1c2d3-e4f5-6a7b-8c9d-0e1f2a3b4c5d' })
  @IsUUID()
  @IsNotEmpty()
  aelsLoadId: string;

  @ApiProperty({ description: 'A unique idempotency key to prevent duplicate escrow requests.', format: 'uuid', example: 'f8e7d6c5-b4a3-2109-fedc-ba9876543210' })
  @IsUUID()
  @IsNotEmpty()
  idempotencyKey: string;
}

/**
 * DTO for releasing an advance payment from an escrow.
 * This occurs after a "green signal" indicating conditions for advance are met.
 */
export class PayFactorReleaseAdvanceDto {
  @ApiProperty({ description: 'The unique identifier of the escrow record to release the advance for.', format: 'uuid', example: 'c1d2e3f4-g5h6-7i8j-9k0l-1m2n3o4p5q6r' })
  @IsUUID()
  @IsNotEmpty()
  escrowId: string;

  @ApiProperty({ description: 'Timestamp when the "green signal" was given to release the advance, indicating all conditions are met.', example: '2024-07-30T14:30:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  greenSignalTimestamp: string;
}

/**
 * DTO for a single entry within a driver's payment schedule.
 * Used as a nested object in `PayFactorReleaseSettlementDto`.
 */
export class DriverPaymentScheduleItemDto {
  @ApiProperty({ description: 'The unique identifier for this specific payment entry in the schedule.', format: 'uuid', example: 's1d2f3g4-h5j6-7k8l-9m0n-1o2p3q4r5s6t' })
  @IsUUID()
  @IsNotEmpty()
  paymentEntryId: string; // Assuming a unique ID for each schedule item

  @ApiProperty({ description: 'The amount in cents for this specific payment.', example: 50000 }) // $500.00
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amountCents: number;

  @ApiProperty({ description: 'The date this payment is scheduled for (YYYY-MM-DD or ISO 8601).', example: '2024-08-15' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'A description for this payment entry (e.g., "Factoring Fee", "Remaining Balance").', example: 'Initial factoring advance' })
  @IsOptional()
  @IsString()
  @Length(1, 256)
  description?: string;
}

/**
 * DTO for releasing the final settlement of a factored load.
 * This includes the detailed payment schedule for the driver.
 */
export class PayFactorReleaseSettlementDto {
  @ApiProperty({ description: 'The unique identifier of the escrow record to release the final settlement for.', format: 'uuid', example: 'e1f2g3h4-i5j6-7k8l-9m0n-1o2p3q4r5s6t' })
  @IsUUID()
  @IsNotEmpty()
  escrowId: string;

  @ApiProperty({ description: 'The overall due date for the final settlement (YYYY-MM-DD or ISO 8601).', example: '2024-08-30' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({
    description: 'An array representing the detailed payment schedule for the driver, including amounts and dates.',
    type: [DriverPaymentScheduleItemDto],
    example: [
      {
        paymentEntryId: 's1d2f3g4-h5j6-7k8l-9m0n-1o2p3q4r5s6t',
        amountCents: 50000,
        scheduledDate: '2024-08-15',
        description: 'First installment'
      },
      {
        paymentEntryId: 'u1v2w3x4-y5z6-7a8b-9c0d-1e2f3g4h5i6j',
        amountCents: 30000,
        scheduledDate: '2024-08-30',
        description: 'Final installment'
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DriverPaymentScheduleItemDto)
  driverPaymentSchedule: DriverPaymentScheduleItemDto[];
}
export class PayFactorWebhookDto {
  eventType?: string;
  id?: string;
  tenantId?: string;
  [key: string]: any;
}
