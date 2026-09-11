/**
 * Cryptocurrency Payment Service
 * PORTED FROM: PS-Platform/shared/services/CryptocurrencyService.ts (400 lines)
 *
 * Wallet management, BTC/ETH/USDC/USDT price tracking, portfolio valuation,
 * crypto transaction processing, real-time price data interfaces.
 */
import { Injectable, Logger } from '@nestjs/common';

// ─── Domain Interfaces ──────────────────────────────────────────────

export interface CryptoWallet {
  id: string;
  userId: string;
  tenantId: string;
  currency: 'BTC' | 'ETH' | 'USDC' | 'USDT';
  address: string;
  balance: number;
  balanceUSD: number;
  isActive: boolean;
}

export interface CryptoTransaction {
  id: string;
  walletId: string;
  txHash: string;
  type: 'send' | 'receive' | 'buy' | 'sell' | 'swap';
  currency: string;
  amount: number;
  amountUSD: number;
  fee: number;
  feeUSD: number;
  fromAddress?: string;
  toAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  timestamp: Date;
}

export interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercentage24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface CryptoPortfolio {
  userId: string;
  totalValueUSD: number;
  totalGainLossUSD: number;
  totalGainLossPercentage: number;
  holdings: CryptoHolding[];
  lastUpdated: Date;
}

export interface CryptoHolding {
  currency: string;
  balance: number;
  valueUSD: number;
  costBasis: number;
  gainLossUSD: number;
  gainLossPercentage: number;
  allocation: number; // Portfolio percentage
}

// ─── NestJS Service ─────────────────────────────────────────────────

@Injectable()
export class CryptocurrencyService {
  private readonly logger = new Logger(CryptocurrencyService.name);

  // In production, from CoinGecko/CoinMarketCap API
  private readonly MOCK_PRICES: Record<string, CryptoPriceData> = {
    BTC: { symbol: 'BTC', name: 'Bitcoin', price: 67_500, change24h: 1250, changePercentage24h: 1.88, volume24h: 35_000_000_000, marketCap: 1_320_000_000_000, lastUpdated: new Date() },
    ETH: { symbol: 'ETH', name: 'Ethereum', price: 3_450, change24h: -85, changePercentage24h: -2.40, volume24h: 18_000_000_000, marketCap: 415_000_000_000, lastUpdated: new Date() },
    USDC: { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0, changePercentage24h: 0, volume24h: 8_000_000_000, marketCap: 38_000_000_000, lastUpdated: new Date() },
    USDT: { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: 0.001, changePercentage24h: 0, volume24h: 45_000_000_000, marketCap: 92_000_000_000, lastUpdated: new Date() },
  };

  /**
   * Get current price for a cryptocurrency.
   */
  getPrice(symbol: string): CryptoPriceData | null {
    return this.MOCK_PRICES[symbol.toUpperCase()] ?? null;
  }

  /**
   * Calculate portfolio valuation from a list of wallets.
   */
  calculatePortfolio(userId: string, wallets: CryptoWallet[], costBases: Map<string, number>): CryptoPortfolio {
    let totalValueUSD = 0;
    let totalCostBasis = 0;
    const holdings: CryptoHolding[] = [];

    for (const wallet of wallets) {
      const price = this.getPrice(wallet.currency);
      if (!price) continue;

      const valueUSD = wallet.balance * price.price;
      const costBasis = costBases.get(wallet.id) ?? valueUSD;
      const gainLoss = valueUSD - costBasis;

      totalValueUSD += valueUSD;
      totalCostBasis += costBasis;

      holdings.push({
        currency: wallet.currency,
        balance: wallet.balance,
        valueUSD,
        costBasis,
        gainLossUSD: gainLoss,
        gainLossPercentage: costBasis > 0 ? (gainLoss / costBasis) * 100 : 0,
        allocation: 0, // Calculated below
      });
    }

    // Calculate allocation percentages
    for (const h of holdings) {
      h.allocation = totalValueUSD > 0 ? (h.valueUSD / totalValueUSD) * 100 : 0;
    }

    return {
      userId,
      totalValueUSD,
      totalGainLossUSD: totalValueUSD - totalCostBasis,
      totalGainLossPercentage: totalCostBasis > 0 ? ((totalValueUSD - totalCostBasis) / totalCostBasis) * 100 : 0,
      holdings,
      lastUpdated: new Date(),
    };
  }

  /**
   * Validate a crypto transaction before submitting to blockchain.
   */
  validateTransaction(
    wallet: CryptoWallet,
    amount: number,
    toAddress: string,
  ): { valid: boolean; error?: string; estimatedFeeUSD?: number } {
    if (!wallet.isActive) return { valid: false, error: 'Wallet is inactive' };
    if (amount <= 0) return { valid: false, error: 'Amount must be positive' };
    if (amount > wallet.balance) return { valid: false, error: 'Insufficient balance' };
    if (!toAddress || toAddress.length < 20) return { valid: false, error: 'Invalid destination address' };

    // Estimated network fees
    const FEES: Record<string, number> = { BTC: 5.50, ETH: 3.20, USDC: 2.00, USDT: 2.00 };
    const estimatedFeeUSD = FEES[wallet.currency] ?? 3.00;

    return { valid: true, estimatedFeeUSD };
  }

  /**
   * Convert between crypto currencies using current prices.
   */
  getConversionRate(fromCurrency: string, toCurrency: string): { rate: number; inverseRate: number } | null {
    const from = this.getPrice(fromCurrency);
    const to = this.getPrice(toCurrency);
    if (!from || !to || to.price === 0) return null;
    const rate = from.price / to.price;
    return { rate, inverseRate: 1 / rate };
  }
}
