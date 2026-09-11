import { IsInt, Min, IsString, IsIn, IsUUID, IsOptional } from 'class-validator';

/**
 * DTO for topping up a digital wallet.
 */
export class TopUpDto {
  @IsInt()
  @Min(100) // Minimum top-up amount of 100 cents (e.g., $1.00)
  amountCents: number;

  @IsString()
  @IsIn(['card', 'ach'])
  method: 'card' | 'ach';

  @IsUUID()
  paymentMethodId: string;
}

/**
 * DTO for transferring funds between digital wallets.
 */
export class TransferDto {
  @IsUUID()
  recipientUserId: string;

  @IsInt()
  @Min(100) // Minimum transfer amount of 100 cents (e.g., $1.00)
  amountCents: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

/**
 * DTO for setting daily and per-transaction limits on a digital wallet.
 * A value of null or 0 might be interpreted as no limit, depending on business logic.
 * For now, just ensuring it's an int and non-negative.
 */
export class SetLimitsDto {
  @IsOptional()
  @IsInt()
  @Min(0) // 0 or null could mean no limit, or the limit is 0
  dailyLimitCents?: number;

  @IsOptional()
  @IsInt()
  @Min(0) // 0 or null could mean no limit, or the limit is 0
  perTransactionLimitCents?: number;
}
export { TransferDto as TransferFundsDto };

// ─── Auto-generated DTO stubs ───
export class FreezeWalletDto { [key: string]: any; }
export class UnfreezeWalletDto { [key: string]: any; }
export class PlaceDisputeHoldDto { [key: string]: any; }
export class ReleaseDisputeHoldDto { [key: string]: any; }
export class TopupWalletDto { [key: string]: any; }
export class PaginationDto { [key: string]: any; }
export class WalletStatementQueryDto { [key: string]: any; }
export class SetSpendingLimitsDto { [key: string]: any; }
