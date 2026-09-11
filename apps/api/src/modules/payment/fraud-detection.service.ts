/**
 * AI Fraud Detection Service (Rule-Based Scoring Engine)
 * PORTED FROM: PS-Platform/DigitalWallets-Web/services/AIFraudDetection.ts (553 lines)
 *
 * Scoring dimensions: amount anomaly (z-score), time analysis, geolocation (Haversine),
 * device fingerprint, velocity checks, pattern detection, user behavior profiling (EMA α=0.1).
 */
import { Injectable, Logger } from '@nestjs/common';

// ─── Domain Interfaces ──────────────────────────────────────────────

export interface FraudCheckRequest {
  transactionId: string;
  tenantId: string;
  customerId: string;
  amountCents: number;
  currency: string;
  merchantId: string;
  ipAddress: string;
  deviceFingerprint?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
}

export interface FraudCheckResult {
  transactionId: string;
  riskScore: number;          // 0-100
  decision: 'ALLOW' | 'REVIEW' | 'BLOCK';
  signals: FraudSignal[];
  evaluatedAt: Date;
}

export interface FraudSignal {
  dimension: string;
  score: number;
  weight: number;
  description: string;
}

interface UserProfile {
  customerId: string;
  avgAmountCents: number;
  stdDevAmount: number;
  avgHourOfDay: number;
  lastLat?: number;
  lastLon?: number;
  transactionCount: number;
  lastTransactionAt?: Date;
}

// ─── Service ────────────────────────────────────────────────────────

@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);
  private readonly EMA_ALPHA = 0.1;

  // In production these would be in Redis/DB; in-memory for now
  private readonly profiles = new Map<string, UserProfile>();

  // Rule weights (sum = 1.0)
  private readonly WEIGHTS = {
    amountAnomaly: 0.25,
    timeAnomaly: 0.10,
    geoAnomaly: 0.20,
    deviceAnomaly: 0.15,
    velocity: 0.20,
    behaviorAnomaly: 0.10,
  };

  /**
   * Evaluate a transaction for fraud risk.
   * Returns 0-100 score and ALLOW / REVIEW / BLOCK decision.
   */
  async evaluate(req: FraudCheckRequest): Promise<FraudCheckResult> {
    const profile = this.getOrCreateProfile(req.customerId);
    const signals: FraudSignal[] = [];

    // 1. Amount Anomaly (z-score)
    const amountZ = profile.stdDevAmount > 0
      ? Math.abs(req.amountCents - profile.avgAmountCents) / profile.stdDevAmount
      : 0;
    const amountScore = Math.min(100, amountZ * 25);
    signals.push({ dimension: 'amount_anomaly', score: amountScore, weight: this.WEIGHTS.amountAnomaly, description: `z-score=${amountZ.toFixed(2)}` });

    // 2. Time Anomaly (unusual hour)
    const hour = (req.timestamp ?? new Date()).getHours();
    const hourDiff = Math.abs(hour - profile.avgHourOfDay);
    const timeScore = Math.min(100, hourDiff * 8);
    signals.push({ dimension: 'time_anomaly', score: timeScore, weight: this.WEIGHTS.timeAnomaly, description: `hour=${hour} avg=${profile.avgHourOfDay.toFixed(0)}` });

    // 3. Geolocation Anomaly (Haversine distance)
    let geoScore = 0;
    if (req.latitude && req.longitude && profile.lastLat != null && profile.lastLon != null) {
      const distKm = this.haversine(profile.lastLat, profile.lastLon, req.latitude, req.longitude);
      const timeSinceLastMs = profile.lastTransactionAt ? Date.now() - profile.lastTransactionAt.getTime() : Infinity;
      const maxPossibleKm = (timeSinceLastMs / 3_600_000) * 900; // ~900 km/h max (jet)
      geoScore = distKm > maxPossibleKm ? Math.min(100, (distKm / maxPossibleKm) * 50) : 0;
      signals.push({ dimension: 'geo_anomaly', score: geoScore, weight: this.WEIGHTS.geoAnomaly, description: `dist=${distKm.toFixed(0)}km max=${maxPossibleKm.toFixed(0)}km` });
    } else {
      signals.push({ dimension: 'geo_anomaly', score: 0, weight: this.WEIGHTS.geoAnomaly, description: 'no geo data' });
    }

    // 4. Device Fingerprint
    const deviceScore = req.deviceFingerprint ? 0 : 30; // Unknown device = risk
    signals.push({ dimension: 'device_anomaly', score: deviceScore, weight: this.WEIGHTS.deviceAnomaly, description: req.deviceFingerprint ? 'known device' : 'unknown device' });

    // 5. Velocity (transactions per hour)
    let velocityScore = 0;
    if (profile.lastTransactionAt) {
      const minutesSinceLast = (Date.now() - profile.lastTransactionAt.getTime()) / 60_000;
      if (minutesSinceLast < 1) velocityScore = 80;
      else if (minutesSinceLast < 5) velocityScore = 40;
      else if (minutesSinceLast < 15) velocityScore = 10;
    }
    signals.push({ dimension: 'velocity', score: velocityScore, weight: this.WEIGHTS.velocity, description: `since_last=${profile.lastTransactionAt ? ((Date.now() - profile.lastTransactionAt.getTime()) / 60_000).toFixed(1) + 'min' : 'first'}` });

    // 6. Behavioral Profile Divergence
    const behaviorScore = profile.transactionCount < 5 ? 15 : 0; // New account = slight risk
    signals.push({ dimension: 'behavior_anomaly', score: behaviorScore, weight: this.WEIGHTS.behaviorAnomaly, description: `txn_count=${profile.transactionCount}` });

    // Weighted composite score
    const riskScore = Math.round(
      signals.reduce((sum, s) => sum + s.score * s.weight, 0),
    );

    // Decision thresholds
    const decision: FraudCheckResult['decision'] = riskScore >= 70 ? 'BLOCK' : riskScore >= 40 ? 'REVIEW' : 'ALLOW';

    // Update profile with EMA
    this.updateProfile(profile, req);

    this.logger.log(
      `[FRAUD] txn=${req.transactionId} score=${riskScore} decision=${decision} | tenant=${req.tenantId}`,
    );

    return { transactionId: req.transactionId, riskScore, decision, signals, evaluatedAt: new Date() };
  }

  // ─── Haversine Formula ────────────────────────────────────────

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6_371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // ─── Profile Management (EMA) ─────────────────────────────────

  private getOrCreateProfile(customerId: string): UserProfile {
    if (!this.profiles.has(customerId)) {
      this.profiles.set(customerId, {
        customerId, avgAmountCents: 0, stdDevAmount: 0,
        avgHourOfDay: 12, transactionCount: 0,
      });
    }
    return this.profiles.get(customerId)!;
  }

  private updateProfile(profile: UserProfile, req: FraudCheckRequest): void {
    const α = this.EMA_ALPHA;
    profile.avgAmountCents = α * req.amountCents + (1 - α) * profile.avgAmountCents;
    const diff = req.amountCents - profile.avgAmountCents;
    profile.stdDevAmount = Math.sqrt(α * diff * diff + (1 - α) * profile.stdDevAmount ** 2);
    const hour = (req.timestamp ?? new Date()).getHours();
    profile.avgHourOfDay = α * hour + (1 - α) * profile.avgHourOfDay;
    if (req.latitude) profile.lastLat = req.latitude;
    if (req.longitude) profile.lastLon = req.longitude;
    profile.lastTransactionAt = req.timestamp ?? new Date();
    profile.transactionCount++;
  }
}
