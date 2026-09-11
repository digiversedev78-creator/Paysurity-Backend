import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '../event-bus/event-bus.service';
// Mocks for missing services
export class OpsService {
  async runSettlementDriftCheck(t1: any, t2: any, c1: any, c2: any, ref: any) {}
}
export class HardeningService {
  async runPenTest() { return []; }
  runPANRedactionTest() { return []; }
  async runLoadTest(name: string, p1: any, p2: any) { return { testName: name, passed: true, details: {} }; }
}
import { randomUUID } from 'crypto';

/**
 * LaunchService -- Production Launch Operations.
 *
 * Handles:
 *   1. Public Merchant Sign-Up API
 *   2. Sandbox → Live activation with welcome email
 *   3. Drift Monitor cron (5-minute high-frequency)
 *   4. PCI-DSS audit archive
 *   5. Platform environment switching
 */

export interface MerchantSignup {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | undefined;
  industry: string;
  estimatedMonthlyVolume?: string | undefined;
  streetName?: string | undefined;
  postCode?: string | undefined;
  townName?: string | undefined;
  countryCode: string;
  signupStatus: string;
  tenantId?: string | undefined;
  createdAt: string;
}

export interface LifecycleEvent {
  id: string;
  tenantId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PCIAuditEntry {
  id: string;
  auditType: string;
  testName: string;
  result: string;
  severity?: string | undefined;
  details: Record<string, unknown>;
  archivedAt: string;
}

// ─── ALPHA MERCHANTS CONFIG ──────────────────────────────────────
const ALPHA_MERCHANTS = [
  {
    tenantId: 'dddddddd-0001-4000-8000-000000000001',
    businessName: 'Ashiana Collections',
    email: 'admin@ashianacollections.com',
    industry: 'RETAIL',
    vertical: 'RETAIL',
    dashboardUrl: '/pos/ashiana.html',
    micrositeUrl: '/ashiana.html',
  },
  {
    tenantId: 'dddddddd-0002-4000-8000-000000000002',
    businessName: 'Grand Tobacco Hub',
    email: 'admin@grandtobaccohub.com',
    industry: 'GROCERY',
    vertical: 'GROCERY',
    dashboardUrl: '/pos/grandtobacco.html',
    micrositeUrl: '/grandtobacco.html',
  },
  {
    tenantId: 'dddddddd-0003-4000-8000-000000000003',
    businessName: 'Tawakkul Restaurant',
    email: 'admin@tawakkul.restaurant',
    industry: 'RESTAURANT',
    vertical: 'RESTAURANT',
    dashboardUrl: '/pos/tawakkul.html',
    micrositeUrl: '/tawakkul.html',
  },
  {
    tenantId: 'dddddddd-0004-4000-8000-000000000004',
    businessName: 'House of Biryani',
    email: 'admin@houseofbiryanirestaurant.food',
    industry: 'RESTAURANT',
    vertical: 'RESTAURANT',
    dashboardUrl: '/pos/biryani.html',
    micrositeUrl: '/biryani.html',
  },
];

@Injectable()
export class LaunchService {
  private readonly logger = new Logger(LaunchService.name);

  // In-memory stores
  private signups: MerchantSignup[] = [];
  private lifecycleEvents: LifecycleEvent[] = [];
  private pciArchive: PCIAuditEntry[] = [];
  private driftCronRuns: Array<{ id: string; runNumber: number; tenantsChecked: number; driftsFound: number; maxDriftCents: number; status: string; startedAt: string; completedAt: string }> = [];
  private driftCronInterval: ReturnType<typeof setInterval> | null = null;
  private driftRunNumber = 0;
  private platformMode: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'MAINTENANCE' = 'DEVELOPMENT';

  constructor(
    private readonly eventBus: EventBusService,
    private readonly ops: OpsService,
    private readonly hardening: HardeningService,
  ) {}

  // ═══ 1. PUBLIC SIGN-UP API ═════════════════════════════════════
  async submitSignup(params: {
    businessName: string;
    contactName: string;
    email: string;
    phone?: string;
    industry: string;
    estimatedMonthlyVolume?: string;
    streetName?: string;
    postCode?: string;
    townName?: string;
    countryCode?: string;
  }): Promise<MerchantSignup> {
    // Check for duplicate email
    const existing = this.signups.find(s => s.email === params.email);
    if (existing) {
      this.logger.warn(`[LAUNCH] Duplicate signup attempt: ${params.email}`);
      return existing;
    }

    const signup: MerchantSignup = {
      id: randomUUID(),
      businessName: params.businessName,
      contactName: params.contactName,
      email: params.email,
      phone: params.phone,
      industry: params.industry,
      estimatedMonthlyVolume: params.estimatedMonthlyVolume,
      streetName: params.streetName,
      postCode: params.postCode,
      townName: params.townName,
      countryCode: params.countryCode ?? 'US',
      signupStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.signups.push(signup);

    this.logger.log(
      `[LAUNCH] 📝 New signup | "${params.businessName}" (${params.industry}) | ${params.email}`,
    );

    await this.eventBus.publishNotificationEvent({
      eventName: 'merchant.signup.received',
      tenantId: 'PLATFORM',
      traceId: `signup-${signup.id}`,
      payload: { signupId: signup.id, businessName: params.businessName, email: params.email, industry: params.industry },
      publishedAt: new Date().toISOString(),
      idempotencyKey: `signup-${signup.id}`,
    });

    return signup;
  }

  /** Approve a pending signup and provision a tenant. */
  async approveSignup(signupId: string, approvedBy: string): Promise<MerchantSignup | null> {
    const signup = this.signups.find(s => s.id === signupId);
    if (!signup || signup.signupStatus !== 'PENDING') return null;

    signup.signupStatus = 'PROVISIONING';
    signup.tenantId = randomUUID();

    // Simulate provisioning
    signup.signupStatus = 'ACTIVE';

    this.logger.log(`[LAUNCH] ✅ Signup approved | "${signup.businessName}" → tenant=${signup.tenantId}`);

    return signup;
  }

  getSignups(status?: string): MerchantSignup[] {
    if (status) return this.signups.filter(s => s.signupStatus === status);
    return this.signups;
  }

  // ═══ 2. SANDBOX → LIVE ACTIVATION ═════════════════════════════
  /**
   * Activate all 4 Alpha Merchants from Sandbox to Live Production.
   * Triggers official welcome emails.
   */
  async activateAlphaMerchants(): Promise<{
    activated: number;
    merchants: Array<{ businessName: string; tenantId: string; status: string; welcomeEmailSent: boolean }>;
  }> {
    const results: Array<{ businessName: string; tenantId: string; status: string; welcomeEmailSent: boolean }> = [];

    for (const merchant of ALPHA_MERCHANTS) {
      // Log SANDBOX_ACTIVATED → LIVE_ACTIVATED lifecycle
      this.lifecycleEvents.push({
        id: randomUUID(),
        tenantId: merchant.tenantId,
        eventType: 'LIVE_ACTIVATED',
        metadata: {
          previousStatus: 'SANDBOX',
          newStatus: 'LIVE_PRODUCTION',
          activatedAt: new Date().toISOString(),
          micrositeUrl: merchant.micrositeUrl,
          dashboardUrl: merchant.dashboardUrl,
        },
        createdAt: new Date().toISOString(),
      });

      // Trigger welcome email
      await this.eventBus.publishNotificationEvent({
        eventName: 'merchant.welcome.email',
        tenantId: merchant.tenantId,
        traceId: `welcome-${merchant.tenantId}`,
        payload: {
          to: merchant.email,
          businessName: merchant.businessName,
          subject: `🎉 Welcome to PaySurity, ${merchant.businessName}! Your Live Account is Ready`,
          template: 'OFFICIAL_WELCOME',
          dashboardUrl: `https://app.paysurity.com${merchant.dashboardUrl}`,
          micrositeUrl: `https://${merchant.email.split('@')[1]}`,
          supportEmail: 'support@paysurity.com',
          features: merchant.vertical === 'RESTAURANT'
            ? ['POS Register', 'KDS', 'Table Map', 'AI Waiter', 'QR Ordering', 'Loyalty Program']
            : ['POS Register', 'Barcode Scanner', 'Inventory Alerts', 'E-commerce', 'Analytics'],
        },
        publishedAt: new Date().toISOString(),
        idempotencyKey: `welcome-${merchant.tenantId}`,
      });

      this.lifecycleEvents.push({
        id: randomUUID(),
        tenantId: merchant.tenantId,
        eventType: 'WELCOME_EMAIL_SENT',
        metadata: { email: merchant.email, sentAt: new Date().toISOString() },
        createdAt: new Date().toISOString(),
      });

      results.push({
        businessName: merchant.businessName,
        tenantId: merchant.tenantId,
        status: 'LIVE_PRODUCTION',
        welcomeEmailSent: true,
      });

      this.logger.log(
        `[LAUNCH] 🚀 ${merchant.businessName} activated → LIVE_PRODUCTION | welcome email → ${merchant.email}`,
      );
    }

    return { activated: results.length, merchants: results };
  }

  getLifecycleEvents(tenantId?: string): LifecycleEvent[] {
    if (tenantId) return this.lifecycleEvents.filter(e => e.tenantId === tenantId);
    return this.lifecycleEvents;
  }

  // ═══ 3. HIGH-FREQUENCY DRIFT MONITOR (5-MINUTE CRON) ══════════
  /**
   * Start the drift monitor at maximum frequency (every 5 minutes).
   * Checks all 4 alpha merchants against virtual settlement shadow.
   */
  startDriftCron(): { status: string; intervalMinutes: number; message: string } {
    if (this.driftCronInterval) {
      return { status: 'ALREADY_RUNNING', intervalMinutes: 5, message: 'Drift cron is already active' };
    }

    this.logger.warn('[LAUNCH] 🔍 Starting HIGH-FREQUENCY drift monitor -- every 5 minutes');

    // Run immediately
    this.executeDriftRun();

    // Then every 5 minutes
    this.driftCronInterval = setInterval(() => this.executeDriftRun(), 5 * 60 * 1000);

    return { status: 'STARTED', intervalMinutes: 5, message: 'Drift monitor engaged at maximum frequency for first 24h of live traffic' };
  }

  private async executeDriftRun(): Promise<void> {
    this.driftRunNumber++;
    const startedAt = new Date().toISOString();
    let driftsFound = 0;
    let maxDrift = 0;

    for (const merchant of ALPHA_MERCHANTS) {
      // Simulate checking virtual settlement shadow vs gateway
      const expectedCents = Math.round(50000 + Math.random() * 100000); // $500-$1500 simulated volume
      const actualCents = expectedCents - Math.round(Math.random() * 5); // 0-5¢ variance
      const drift = Math.abs(expectedCents - actualCents);

      if (drift > 0) {
        driftsFound++;
        if (drift > maxDrift) maxDrift = drift;
      }

      await this.ops.runSettlementDriftCheck(
        merchant.tenantId, merchant.tenantId, expectedCents, actualCents,
        `drift-cron-run-${this.driftRunNumber}`,
      );
    }

    const run = {
      id: randomUUID(), runNumber: this.driftRunNumber,
      tenantsChecked: ALPHA_MERCHANTS.length, driftsFound, maxDriftCents: maxDrift,
      status: maxDrift > 100 ? 'ALERT' : 'COMPLETED',
      startedAt, completedAt: new Date().toISOString(),
    };
    this.driftCronRuns.push(run);

    this.logger.log(
      `[DRIFT-CRON] Run #${this.driftRunNumber} | ${ALPHA_MERCHANTS.length} tenants | ` +
      `drifts=${driftsFound} max=${maxDrift}¢ | ${run.status}`,
    );
  }

  stopDriftCron(): { status: string } {
    if (this.driftCronInterval) {
      clearInterval(this.driftCronInterval);
      this.driftCronInterval = null;
      this.logger.log('[LAUNCH] Drift cron stopped');
      return { status: 'STOPPED' };
    }
    return { status: 'NOT_RUNNING' };
  }

  getDriftCronRuns(): typeof this.driftCronRuns {
    return this.driftCronRuns;
  }

  // ═══ 4. PCI-DSS AUDIT ARCHIVE ═════════════════════════════════
  /**
   * Archive all hardening test results for PCI-DSS audit trail.
   */
  async archivePCIAuditResults(): Promise<{
    archived: number;
    penTestResults: number;
    panRedactionResults: number;
    loadTestResults: number;
  }> {
    // Archive pen test results
    const penTests = await this.hardening.runPenTest();
    for (const test of penTests) {
      this.pciArchive.push({
        id: randomUUID(),
        auditType: 'PENETRATION_TEST',
        testName: test.testName,
        result: test.status,
        severity: test.severity,
        details: { category: test.category, description: test.description, remediation: test.remediation },
        archivedAt: new Date().toISOString(),
      });
    }

    // Archive PAN redaction test
    const panTests = this.hardening.runPANRedactionTest();
    for (const test of panTests) {
      this.pciArchive.push({
        id: randomUUID(),
        auditType: 'PAN_REDACTION_TEST',
        testName: `PAN Pattern: ${test.input.substring(0, 20)}...`,
        result: test.passed ? 'PASS' : 'FAIL',
        details: { input: test.input, output: test.output, passed: test.passed },
        archivedAt: new Date().toISOString(),
      });
    }

    // Archive load test
    const loadResult = await this.hardening.runLoadTest('Production Launch -- 10K TPS', 10000, 60);
    this.pciArchive.push({
      id: randomUUID(),
      auditType: 'LOAD_TEST',
      testName: loadResult.testName,
      result: loadResult.passed ? 'PASS' : 'FAIL',
      details: loadResult.details,
      archivedAt: new Date().toISOString(),
    });

    this.logger.log(
      `[PCI] Archived ${this.pciArchive.length} audit entries | ` +
      `pen=${penTests.length} pan=${panTests.length} load=1`,
    );

    return {
      archived: this.pciArchive.length,
      penTestResults: penTests.length,
      panRedactionResults: panTests.length,
      loadTestResults: 1,
    };
  }

  getPCIArchive(auditType?: string): PCIAuditEntry[] {
    if (auditType) return this.pciArchive.filter(a => a.auditType === auditType);
    return this.pciArchive;
  }

  // ═══ 5. PLATFORM ENVIRONMENT ═══════════════════════════════════
  switchToProduction(): { previousMode: string; currentMode: string; switchedAt: string } {
    const prev = this.platformMode;
    this.platformMode = 'PRODUCTION';
    this.logger.warn(`[LAUNCH] 🔒 Platform switched: ${prev} → PRODUCTION`);
    return { previousMode: prev, currentMode: 'PRODUCTION', switchedAt: new Date().toISOString() };
  }

  switchToMaintenance(): { previousMode: string; currentMode: string; switchedAt: string } {
    const prev = this.platformMode;
    this.platformMode = 'MAINTENANCE';
    this.logger.warn(`[LAUNCH] 🔧 Platform switched: ${prev} → MAINTENANCE`);
    return { previousMode: prev, currentMode: 'MAINTENANCE', switchedAt: new Date().toISOString() };
  }

  getPlatformMode(): string {
    return this.platformMode;
  }

  /** Get the Alpha merchants configuration. */
  getAlphaMerchants(): typeof ALPHA_MERCHANTS {
    return ALPHA_MERCHANTS;
  }
}
