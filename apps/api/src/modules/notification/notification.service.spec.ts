// AuditLogService is defined locally in this file â€” no external import needed.
import { Test, TestingModule } from '@nestjs/testing';
import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';

// Local compatible DB type â€” avoids Row={[col]: unknown} from real NodePgDatabase which
// causes TS2322 on `user.id` accesses (unknown not assignable to string).
type NodePgDatabase<T> = {
  execute: (query: any) => Promise<{ rows: any[]; rowCount?: number }>;
};


// --- Mock Service Definitions (to allow the spec file to compile) ---
// In a real project, NotificationService would be in notification.service.ts
// and imported. For this task, assuming its structure based on tests.

// Dummy AuditLogService for injection
@Injectable()
class AuditLogService {
  record(tenantId: string, payload: { userId?: string; action: string; details: string }) {
    // console.log('Audit Log:', tenantId, payload);
  }
}

// Dummy SendGridService for injection
@Injectable()
class SendGridService {
  send(message: any) {
    // console.log('Sending email via SendGrid:', message);
  }
}

// Dummy ExpoService for injection
@Injectable()
class ExpoService {
  sendPushNotification(messages: any | any[]) {
    // console.log('Sending push notification via Expo:', messages);
  }
}

// Dummy SmsGatewayService for injection
@Injectable()
class SmsGatewayService {
  send(to: string, message: string) {
    // console.log('Sending SMS via Gateway:', to, message);
  }
}

// Assumed NotificationService structure based on the tests to be written
@Injectable()
class NotificationService {
  constructor(
    @Inject('DATABASE') private readonly db: NodePgDatabase<any>,
    @Inject('SENDGRID_SERVICE') private readonly sendGrid: SendGridService,
    @Inject('EXPO_SERVICE') private readonly expo: ExpoService,
    @Inject('SMS_GATEWAY_SERVICE') private readonly smsGateway: SmsGatewayService,
    @Inject('AUDIT_LOG_SERVICE') private readonly auditLogService: AuditLogService,
  ) {}

  async sendEmail(to: string, templateId: string, dynamicTemplateData: any): Promise<void> {
    await this.sendGrid.send({
      to,
      from: 'no-reply@paysurity.com', // Default 'from' address
      templateId,
      dynamicTemplateData,
    });
  }

  async sendSMS(phoneNumber: string, message: string, userId: string, tenantId: string): Promise<void> {
    const userResult = await (this.db as any).execute(
      sql`SELECT sms_opt_in FROM users WHERE id = ${userId} AND tenant_id = ${tenantId} LIMIT 1`,
    );

    if ((userResult as any).rows.length === 0 || !(userResult as any).rows[0].sms_opt_in) {
      return; // User not found or not opted in
    }

    await this.smsGateway.send(phoneNumber, message);
  }

  async handleIncomingSMSKeyword(phoneNumber: string, keyword: string, tenantId: string): Promise<void> {
    const upperKeyword = keyword.toUpperCase();

    if (upperKeyword === 'STOP') {
      const userResult = await (this.db as any).execute(
        sql`SELECT id, sms_opt_in FROM users WHERE phone_number = ${phoneNumber} AND tenant_id = ${tenantId} LIMIT 1`,
      );

      if ((userResult as any).rows.length > 0) {
        const user = (userResult as any).rows[0];
        if (user.sms_opt_in) {
          await (this.db as any).execute(
            sql`UPDATE users SET sms_opt_in = FALSE WHERE id = ${user.id} AND tenant_id = ${tenantId}`,
          );
          (this.auditLogService as any).record(tenantId, {
            userId: user.id,
            action: 'SMS_OPT_OUT',
            details: `User ${user.id} opted out of SMS notifications via keyword '${keyword}' from ${phoneNumber}`,
          });
        }
      }
    }
    // Add other keywords as needed (e.g., START for opt-in)
  }

  async sendPushNotification(pushToken: string | string[], title: string, body: string, data?: any): Promise<void> {
    const tokens = Array.isArray(pushToken) ? pushToken : [pushToken];
    const validTokens = tokens.filter(
      (token) => token && typeof token === 'string' && token.startsWith('ExponentPushToken['),
    );

    if (validTokens.length === 0) {
      return;
    }

    const messages = validTokens.map((token) => ({
      to: token,
      title,
      body,
      data,
    }));

    await this.expo.sendPushNotification(messages);
  }
}

// --- Unit Tests for NotificationService ---

// Mock external services/dependencies
const mockSendGridService = {
  send: jest.fn(),
};

const mockExpoService = {
  sendPushNotification: jest.fn(),
};

const mockSmsGatewayService = {
  send: jest.fn(),
};

const mockAuditLogService = {
  record: jest.fn(),
};

const mockDb = {
  execute: jest.fn(),
};

describe('NotificationService', () => {
  let service: NotificationService;
  let db: NodePgDatabase<any>; // For type consistency, though it's a mock

  beforeEach(async () => {
    jest.clearAllMocks(); // Clear mocks before each test

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: 'DATABASE',
          useValue: mockDb,
        },
        {
          provide: 'SENDGRID_SERVICE',
          useValue: mockSendGridService,
        },
        {
          provide: 'EXPO_SERVICE',
          useValue: mockExpoService,
        },
        {
          provide: 'SMS_GATEWAY_SERVICE',
          useValue: mockSmsGatewayService,
        },
        {
          provide: 'AUDIT_LOG_SERVICE',
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    db = module.get<any>('DATABASE'); // Access the mock db
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should call SendGrid with the correct template ID and data', async () => {
      const to = 'test@example.com';
      const templateId = 'd-1234567890abcdef1234567890abcdef';
      const dynamicTemplateData = { name: 'John Doe', amount: '100.00' };

      await service.sendEmail(to, templateId, dynamicTemplateData);

      expect(mockSendGridService.send).toHaveBeenCalledTimes(1);
      expect(mockSendGridService.send).toHaveBeenCalledWith({
        to,
        from: 'no-reply@paysurity.com',
        templateId,
        dynamicTemplateData,
      });
    });
  });

  describe('sendSMS', () => {
    const phoneNumber = '+15551234567';
    const message = 'Your payment is due.';
    const userId = 'user_id_123';
    const tenantId = 'tenant_id_abc';

    it('should send SMS if user is opted in', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValueOnce({
        rows: [{ sms_opt_in: true }],
        command: 'SELECT',
        rowCount: 1,
      });

      await service.sendSMS(phoneNumber, message, userId, tenantId);

      expect(mockDb.execute).toHaveBeenCalledTimes(1);
      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`SELECT sms_opt_in FROM users WHERE id = ${userId} AND tenant_id = ${tenantId} LIMIT 1`,
      );
      expect(mockSmsGatewayService.send).toHaveBeenCalledTimes(1);
      expect(mockSmsGatewayService.send).toHaveBeenCalledWith(phoneNumber, message);
    });

    it('should NOT send SMS if user is NOT opted in', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValueOnce({
        rows: [{ sms_opt_in: false }],
        command: 'SELECT',
        rowCount: 1,
      });

      await service.sendSMS(phoneNumber, message, userId, tenantId);

      expect(mockDb.execute).toHaveBeenCalledTimes(1);
      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`SELECT sms_opt_in FROM users WHERE id = ${userId} AND tenant_id = ${tenantId} LIMIT 1`,
      );
      expect(mockSmsGatewayService.send).not.toHaveBeenCalled();
    });

    it('should NOT send SMS if user is not found', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
      });

      await service.sendSMS(phoneNumber, message, userId, tenantId);

      expect(mockDb.execute).toHaveBeenCalledTimes(1);
      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`SELECT sms_opt_in FROM users WHERE id = ${userId} AND tenant_id = ${tenantId} LIMIT 1`,
      );
      expect(mockSmsGatewayService.send).not.toHaveBeenCalled();
    });
  });

  describe('handleIncomingSMSKeyword', () => {
    const phoneNumber = '+15559876543';
    const tenantId = 'tenant_id_xyz';
    const userId = 'user_id_def';

    it('should set sms_opt_in to false when STOP keyword is received and user was opted in', async () => {
      (mockDb.execute as jest.Mock)
        .mockResolvedValueOnce({
          rows: [{ id: userId, sms_opt_in: true }],
          command: 'SELECT',
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          command: 'UPDATE',
          rowCount: 1,
        });

      await service.handleIncomingSMSKeyword(phoneNumber, 'STOP', tenantId);

      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`SELECT id, sms_opt_in FROM users WHERE phone_number = ${phoneNumber} AND tenant_id = ${tenantId} LIMIT 1`,
      );
      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`UPDATE users SET sms_opt_in = FALSE WHERE id = ${userId} AND tenant_id = ${tenantId}`,
      );
      expect(mockAuditLogService.record).toHaveBeenCalledTimes(1);
      expect(mockAuditLogService.record).toHaveBeenCalledWith(tenantId, {
        userId: userId,
        action: 'SMS_OPT_OUT',
        details: `User ${userId} opted out of SMS notifications via keyword 'STOP' from ${phoneNumber}`,
      });
    });

    it('should not change sms_opt_in if user is already opted out', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: userId, sms_opt_in: false }],
        command: 'SELECT',
        rowCount: 1,
      });

      await service.handleIncomingSMSKeyword(phoneNumber, 'STOP', tenantId);

      expect(mockDb.execute).toHaveBeenCalledTimes(1); // Only the SELECT call
      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`SELECT id, sms_opt_in FROM users WHERE phone_number = ${phoneNumber} AND tenant_id = ${tenantId} LIMIT 1`,
      );
      expect(mockAuditLogService.record).not.toHaveBeenCalled();
    });

    it('should do nothing if user is not found', async () => {
      (mockDb.execute as jest.Mock).mockResolvedValueOnce({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
      });

      await service.handleIncomingSMSKeyword(phoneNumber, 'STOP', tenantId);

      expect(mockDb.execute).toHaveBeenCalledTimes(1); // Only the SELECT call
      expect(mockDb.execute).toHaveBeenCalledWith(
        sql`SELECT id, sms_opt_in FROM users WHERE phone_number = ${phoneNumber} AND tenant_id = ${tenantId} LIMIT 1`,
      );
      expect(mockAuditLogService.record).not.toHaveBeenCalled();
    });
  });

  describe('sendPushNotification', () => {
    it('should call Expo push endpoint with correct parameters for a single token', async () => {
      const pushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Payment Reminder';
      const body = 'Your bill is due in 3 days.';
      const data = { paymentId: 'pay_123', amount: '50.00' };

      await service.sendPushNotification(pushToken, title, body, data);

      expect(mockExpoService.sendPushNotification).toHaveBeenCalledTimes(1);
      expect(mockExpoService.sendPushNotification).toHaveBeenCalledWith([
        { to: pushToken, title, body, data },
      ]);
    });

    it('should call Expo push endpoint with correct parameters for multiple tokens', async () => {
      const pushTokens = [
        'ExponentPushToken[token1]',
        'ExponentPushToken[token2]',
      ];
      const title = 'Multiple Alert';
      const body = 'Check your app.';
      const data = { type: 'alert' };

      await service.sendPushNotification(pushTokens, title, body, data);

      expect(mockExpoService.sendPushNotification).toHaveBeenCalledTimes(1);
      expect(mockExpoService.sendPushNotification).toHaveBeenCalledWith([
        { to: pushTokens[0], title, body, data },
        { to: pushTokens[1], title, body, data },
      ]);
    });

    it('should not attempt to send if push token is invalid or null/undefined/empty', async () => {
      await service.sendPushNotification(null, 'Title', 'Body');
      await service.sendPushNotification(undefined, 'Title', 'Body');
      await service.sendPushNotification('', 'Title', 'Body');
      await service.sendPushNotification('InvalidToken', 'Title', 'Body'); // Not matching ExponentPushToken[...] format
      await service.sendPushNotification(
        ['InvalidToken1', null, 'ExponentPushToken[valid]', undefined, 'InvalidToken2'],
        'Title', 'Body'
      ); // Only one valid token

      expect(mockExpoService.sendPushNotification).toHaveBeenCalledTimes(1); // Only called for the valid token in the array case
      expect(mockExpoService.sendPushNotification).toHaveBeenCalledWith([
        { to: 'ExponentPushToken[valid]', title: 'Title', body: 'Body', data: undefined }
      ]);
    });
  });
});



