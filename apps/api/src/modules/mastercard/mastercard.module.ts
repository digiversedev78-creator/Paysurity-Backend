import { Module } from '@nestjs/common';
import { OpenFinanceAdapter } from './open-finance.adapter';
import { MastercardSendAdapter } from './mastercard-send.adapter';
import { MatchProAdapter } from './match-pro.adapter';
import { MastercardService } from './mastercard.service';
import { MastercardController } from './mastercard.controller';
import { ConfigModule } from '@nestjs/config'; // Add ConfigModule for environment variables
// Import DatabaseModule
import { AuditLogModule } from '../audit-log/audit-log.module'; // Import AuditLogModule

/**
 * MastercardModule -- 3 external API integrations:
 *
 *  1. Open Finance (via Finicity) -- Account verification, balance, income
 *  2. Mastercard Send -- Instant payouts to debit cards, bank accounts, wallets
 *  3. MATCH Pro -- TMF merchant screening for compliance
 *
 * Exports: MastercardService (the unified facade)
 *
 * Required env vars:
 *   MC_OPEN_FINANCE_PARTNER_ID, MC_OPEN_FINANCE_PARTNER_SECRET,
 *   MC_OPEN_FINANCE_APP_KEY, MC_OPEN_FINANCE_BASE_URL,
 *   MC_SEND_CONSUMER_KEY, MC_SEND_PARTNER_ID, MC_SEND_BASE_URL,
 *   MC_MATCH_CONSUMER_KEY, MC_MATCH_BASE_URL,
 *   PAYSURITY_ACQUIRER_ID
 */
@Module({
  imports: [
    ConfigModule, // Make ConfigModule available to access environment variables
    // Provide database connection to services
    AuditLogModule, // Provide audit logging capabilities
  ],
  providers: [
    // ── Adapters (internal, not exported) ────────────────────
    OpenFinanceAdapter,
    MastercardSendAdapter,
    MatchProAdapter,
    // ── Facade ───────────────────────────────────────────────
    MastercardService,
  ],
  controllers: [MastercardController],
  exports: [MastercardService],
})
export class MastercardModule {}
