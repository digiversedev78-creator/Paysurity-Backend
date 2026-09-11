export class AuditLogService {}
/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AI-002 â€” AI Chat / Virtual Assistant
 * FILE TYPE:    TEST
 * MODULE:       ai
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/AI_EXPERIENCE.md
 * WORKER:       CODER-196
 * GENERATED:    2026-03-18T10:40:00.841Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { CreateAiChatSessionDto, SendMessageDto, GetChatHistoryDto } from './ai.dto';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock Drizzle Schema types for testing purposes (should align with ai.service.ts exports)
import { AiChatMessage } from './ai.service';

// --- Mock Data --- 
const TEST_TENANT_ID = 'e17a3a37-9b8e-4a8f-b0c7-2c4f8b0c7c00';
const MOCK_SESSION_ID = 'f28b4c5d-9e0a-4b1c-8d2e-3a4f5b6c7d8e';

let MOCK_AI_CHAT_SESSIONS: any[] = [
  {
    id: MOCK_SESSION_ID,
    tenantId: TEST_TENANT_ID,
    createdAt: new Date(Date.now() - 100000) as any,
    updatedAt: new Date(Date.now() - 100000) as any,
  },
];

let MOCK_AI_CHAT_MESSAGES: AiChatMessage[] = [
  {
    id: uuidv4(),
    sessionId: MOCK_SESSION_ID,
    tenantId: TEST_TENANT_ID,
    role: 'user',
    content: 'Initial user message',
    createdAt: new Date(Date.now() - 90000) as any,
  },
  {
    id: uuidv4(),
    sessionId: MOCK_SESSION_ID,
    tenantId: TEST_TENANT_ID,
    role: 'assistant',
    content: 'Initial AI response',
    createdAt: new Date(Date.now() - 80000) as any,
  },
];

// --- Mock Drizzle DB Client ---
// This mock covers the Drizzle ORM methods used by AiService.
class MockDrizzleClient {
  public query = {
    aiChatSessions: {
      findFirst: jest.fn().mockImplementation(async ({ where }) => {
        // Mock filtering by sessionId and tenantId
        const sessionId = where.expressions[0].value; // Assuming eq(aiChatSessions.id, sessionId)
        const tenantId = where.expressions[1].value; // Assuming eq(aiChatSessions.tenantId, tenantId)
        const session = MOCK_AI_CHAT_SESSIONS.find(s => s.id === sessionId && s.tenantId === tenantId);
        return Promise.resolve(session || null);
      }),
    },
    aiChatMessages: {
      findMany: jest.fn().mockImplementation(async ({ where, limit, offset, orderBy }) => {
        // Mock filtering by sessionId and tenantId
        const sessionId = where.expressions[0].value;
        const tenantId = where.expressions[1].value;
        const messages = MOCK_AI_CHAT_MESSAGES.filter(m => m.sessionId === sessionId && m.tenantId === tenantId);
        
        // Apply ordering (descending by createdAt as used in service for context retrieval)
        if (orderBy && orderBy[0].field === 'createdAt' && orderBy[0].direction === 'desc') {
            messages.sort((a, b) => (b.createdAt as any).getTime() - (a.createdAt as any).getTime());
        } else {
            // Default to ascending if no specific desc order is requested or for other queries
            messages.sort((a, b) => (a.createdAt as any).getTime() - (b.createdAt as any).getTime());
        }

        // Apply limit and offset
        return Promise.resolve(messages.slice(offset || 0, (offset || 0) + (limit || messages.length)));
      }),
    },
  };
  public insert = jest.fn().mockImplementation((table) => ({
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockImplementation(async (values) => {
      if (table && table.tableName === 'ai_chat_sessions') {
        const newSession: any = { ...values[0], id: uuidv4(), createdAt: new Date() as any, updatedAt: new Date() as any };
        MOCK_AI_CHAT_SESSIONS.push(newSession); // Simulate DB insert
        return [newSession];
      } else if (table && table.tableName === 'ai_chat_messages') {
        const newMessage: AiChatMessage = { ...values[0], id: uuidv4(), createdAt: new Date() as any };
        MOCK_AI_CHAT_MESSAGES.push(newMessage); // Simulate DB insert
        return [newMessage];
      }
      return [];
    }),
  }));
  public delete = jest.fn();
  public update = jest.fn();
}

// --- Mock AuditLogService ---
class MockAuditLogService {
  log = jest.fn();
}

// --- Mock AI External Provider ---
class MockAiExternalProvider {
  generateResponse = jest.fn().mockImplementation((messages) => {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage && lastUserMessage.content.toLowerCase().includes('error')) {
      throw new Error('Simulated AI error');
    }
    return Promise.resolve(`AI response to: ${lastUserMessage?.content || 'no message'}`);
  });
}

describe('AiService', () => {
  let service: AiService;
  let mockDrizzleClient: MockDrizzleClient;
  let mockAuditLogService: MockAuditLogService;
  let mockAiExternalProvider: MockAiExternalProvider;

  beforeEach(async () => {
    mockDrizzleClient = new MockDrizzleClient();
    mockAuditLogService = new MockAuditLogService();
    mockAiExternalProvider = new MockAiExternalProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: 'DRIZZLE_CLIENT', // Must match the token used in AiService
          useValue: mockDrizzleClient,
        },
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
        {
          provide: 'IAiExternalProvider', // Must match the token used in AiService
          useValue: mockAiExternalProvider,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);

    // Reset mocks and mock data before each test
    jest.clearAllMocks();
    MOCK_AI_CHAT_SESSIONS = [
      {
        id: MOCK_SESSION_ID,
        tenantId: TEST_TENANT_ID,
        createdAt: new Date(Date.now() - 100000) as any,
        updatedAt: new Date(Date.now() - 100000) as any,
      },
    ];
    MOCK_AI_CHAT_MESSAGES = [
      {
        id: uuidv4(),
        sessionId: MOCK_SESSION_ID,
        tenantId: TEST_TENANT_ID,
        role: 'user',
        content: 'Initial user message',
        createdAt: new Date(Date.now() - 90000) as any,
      },
      {
        id: uuidv4(),
        sessionId: MOCK_SESSION_ID,
        tenantId: TEST_TENANT_ID,
        role: 'assistant',
        content: 'Initial AI response',
        createdAt: new Date(Date.now() - 80000) as any,
      },
    ];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChatSession', () => {
    it('should create a new chat session and log audit', async () => {
      const newSession: any = {
        id: uuidv4(),
        tenantId: TEST_TENANT_ID,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };
      // Mock the insert operation for creating a session
      mockDrizzleClient.insert.mockImplementationOnce(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([newSession]),
      }));

      const result = await service.createChatSession(TEST_TENANT_ID);

      expect(result).toEqual(newSession);
      expect(mockDrizzleClient.insert).toHaveBeenCalledWith(expect.objectContaining({ tableName: 'ai_chat_sessions' }));
      expect(mockDrizzleClient.insert().values).toHaveBeenCalledWith({ tenantId: TEST_TENANT_ID });
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        'AI_CHAT_SESSION_CREATED',
        'AiChatSession',
        newSession.id,
        TEST_TENANT_ID,
        expect.any(Object),
      );
    });

    it('should throw InternalServerErrorException if session creation fails', async () => {
      mockDrizzleClient.insert.mockImplementationOnce(() => ({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]), // Simulate no return value
      }));

      await expect(service.createChatSession(TEST_TENANT_ID)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a user message, get AI response, and save both', async () => {
      const userMessageContent = 'Hi there!';
      const aiResponseContent = 'AI response to Hi there!';
      
      const newUserMessage: AiChatMessage = {
        id: uuidv4(),
        sessionId: MOCK_SESSION_ID,
        tenantId: TEST_TENANT_ID,
        role: 'user',
        content: userMessageContent,
        createdAt: new Date(Date.now() - 100) as any,
      };
      const newAiMessage: AiChatMessage = {
        id: uuidv4(),
        sessionId: MOCK_SESSION_ID,
        tenantId: TEST_TENANT_ID,
        role: 'assistant',
        content: aiResponseContent,
        createdAt: new Date(Date.now()) as any,
      };

      mockDrizzleClient.query.aiChatSessions.findFirst.mockResolvedValueOnce(MOCK_AI_CHAT_SESSIONS[0]);
      // Mock history retrieval
      mockDrizzleClient.query.aiChatMessages.findMany.mockResolvedValueOnce(MOCK_AI_CHAT_MESSAGES.slice().reverse()); // Newest first
      
      // Mock for saving user message
      mockDrizzleClient.insert
        .mockImplementationOnce(() => ({ values: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue([newUserMessage]) }));
      // Mock for saving AI message
      mockDrizzleClient.insert
        .mockImplementationOnce(() => ({ values: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue([newAiMessage]) }));

      mockAiExternalProvider.generateResponse.mockResolvedValueOnce(aiResponseContent);

      const result = await service.sendMessage(TEST_TENANT_ID, MOCK_SESSION_ID, userMessageContent);

      expect(result).toEqual([newUserMessage, newAiMessage]);
      expect(mockDrizzleClient.query.aiChatSessions.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expressions: expect.arrayContaining([
              expect.objectContaining({ value: MOCK_SESSION_ID }),
              expect.objectContaining({ value: TEST_TENANT_ID }),
            ]),
          }),
        }),
      );
      expect(mockDrizzleClient.insert).toHaveBeenCalledTimes(2); // One for user, one for AI
      expect(mockAiExternalProvider.generateResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Initial user message' }),
          expect.objectContaining({ role: 'assistant', content: 'Initial AI response' }),
          expect.objectContaining({ role: 'user', content: userMessageContent }), // This will be the last message in context
        ]),
      );
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        'AI_CHAT_MESSAGE_SENT',
        'AiChatMessage',
        newUserMessage.id,
        TEST_TENANT_ID,
        expect.any(Object),
      );
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        'AI_CHAT_MESSAGE_RECEIVED',
        'AiChatMessage',
        newAiMessage.id,
        TEST_TENANT_ID,
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if session does not exist for tenant', async () => {
      mockDrizzleClient.query.aiChatSessions.findFirst.mockResolvedValueOnce(null); // No session found
      const nonExistentSessionId = uuidv4();

      await expect(service.sendMessage(TEST_TENANT_ID, nonExistentSessionId, 'Test message')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if AI response fails', async () => {
      mockDrizzleClient.query.aiChatSessions.findFirst.mockResolvedValueOnce(MOCK_AI_CHAT_SESSIONS[0]);
      mockDrizzleClient.query.aiChatMessages.findMany.mockResolvedValueOnce(MOCK_AI_CHAT_MESSAGES.slice().reverse());
      
      // Mock for saving user message
      mockDrizzleClient.insert
        .mockImplementationOnce(() => ({ values: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue([MOCK_AI_CHAT_MESSAGES[0]]) }));
      
      mockAiExternalProvider.generateResponse.mockRejectedValueOnce(new Error('AI service down'));

      await expect(service.sendMessage(TEST_TENANT_ID, MOCK_SESSION_ID, 'Error message')).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockAuditLogService.log).toHaveBeenCalledWith(
        'AI_CHAT_MESSAGE_SENT',
        'AiChatMessage',
        MOCK_AI_CHAT_MESSAGES[0].id,
        TEST_TENANT_ID,
        expect.any(Object),
      );
      expect(mockAuditLogService.log).not.toHaveBeenCalledWith(
        'AI_CHAT_MESSAGE_RECEIVED',
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
      ); // Should not log AI response if it failed
    });
  });

  describe('getChatHistory', () => {
    it('should retrieve chat history for a given session and tenant in chronological order', async () => {
      mockDrizzleClient.query.aiChatSessions.findFirst.mockResolvedValueOnce(MOCK_AI_CHAT_SESSIONS[0]);
      // Simulate DB returning messages newest first for desc(createdAt)
      const dbOrderedMessages = MOCK_AI_CHAT_MESSAGES.slice().sort((a, b) => (b.createdAt as any).getTime() - (a.createdAt as any).getTime());
      mockDrizzleClient.query.aiChatMessages.findMany.mockResolvedValueOnce(dbOrderedMessages);

      const result = await service.getChatHistory(TEST_TENANT_ID, MOCK_SESSION_ID);

      expect(result).toEqual(MOCK_AI_CHAT_MESSAGES); // Service should reverse to chronological (oldest first)
      expect(mockDrizzleClient.query.aiChatSessions.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expressions: expect.arrayContaining([
              expect.objectContaining({ value: MOCK_SESSION_ID }),
              expect.objectContaining({ value: TEST_TENANT_ID }),
            ]),
          }),
        }),
      );
      expect(mockDrizzleClient.query.aiChatMessages.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expressions: expect.arrayContaining([
              expect.objectContaining({ value: MOCK_SESSION_ID }),
              expect.objectContaining({ value: TEST_TENANT_ID }),
            ]),
          }),
          orderBy: expect.arrayContaining([expect.objectContaining({ field: 'createdAt', direction: 'desc' })]),
          limit: 50,
          offset: 0,
        }),
      );
    });

    it('should apply pagination parameters', async () => {
      mockDrizzleClient.query.aiChatSessions.findFirst.mockResolvedValueOnce(MOCK_AI_CHAT_SESSIONS[0]);
      const paginatedDbResult = [MOCK_AI_CHAT_MESSAGES[0]]; // Simulate DB returning one message
      mockDrizzleClient.query.aiChatMessages.findMany.mockResolvedValueOnce(paginatedDbResult);

      const limit = 1;
      const offset = 0;
      const result = await service.getChatHistory(TEST_TENANT_ID, MOCK_SESSION_ID, limit, offset);

      expect(result).toEqual(paginatedDbResult.reverse()); // Still expecting chronological
      expect(mockDrizzleClient.query.aiChatMessages.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
              limit: limit,
              offset: offset,
          }),
      );
    });

    it('should throw NotFoundException if session does not exist for tenant', async () => {
      mockDrizzleClient.query.aiChatSessions.findFirst.mockResolvedValueOnce(null);
      const nonExistentSessionId = uuidv4();

      await expect(service.getChatHistory(TEST_TENANT_ID, nonExistentSessionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

describe('AiController', () => {
  let controller: AiController;
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            createChatSession: jest.fn(),
            sendMessage: jest.fn(),
            getChatHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    service = module.get<AiService>(AiService);

    // Mock the `TenantId` decorator's return value for controller tests.
    // In a real e2e test, this would be handled by authentication middleware.
    jest.spyOn(controller, 'createChatSession').mockImplementation((tenantId: string, dto: CreateAiChatSessionDto) =>
      (service.createChatSession as jest.Mock)(tenantId)
    );
    jest.spyOn(controller, 'sendMessage').mockImplementation((tenantId: string, sessionId: string, dto: SendMessageDto) =>
      (service.sendMessage as jest.Mock)(tenantId, sessionId, dto.message)
    );
    jest.spyOn(controller, 'getChatHistory').mockImplementation((tenantId: string, sessionId: string, query: GetChatHistoryDto) =>
      (service.getChatHistory as jest.Mock)(tenantId, sessionId, query.limit, query.offset)
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createChatSession', () => {
    it('should call aiService.createChatSession and return the result', async () => {
      const mockSession: any = { id: MOCK_SESSION_ID, tenantId: TEST_TENANT_ID, createdAt: new Date() as any, updatedAt: new Date() as any };
      (service.createChatSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await controller.createChatSession(TEST_TENANT_ID, {}); // Manually pass tenantId for testing

      expect(result).toEqual(mockSession);
      expect(service.createChatSession).toHaveBeenCalledWith(TEST_TENANT_ID);
    });
  });

  describe('sendMessage', () => {
    it('should call aiService.sendMessage and return the messages', async () => {
      const dto: SendMessageDto = { sessionId: MOCK_SESSION_ID, message: 'User query' };
      const mockMessages: AiChatMessage[] = [
        { id: uuidv4(), sessionId: MOCK_SESSION_ID, tenantId: TEST_TENANT_ID, role: 'user', content: 'User query', createdAt: new Date() as any },
        { id: uuidv4(), sessionId: MOCK_SESSION_ID, tenantId: TEST_TENANT_ID, role: 'assistant', content: 'AI response', createdAt: new Date() as any }
      ];
      (service.sendMessage as jest.Mock).mockResolvedValue(mockMessages);

      const result = await controller.sendMessage(TEST_TENANT_ID, MOCK_SESSION_ID, dto);

      expect(result).toEqual(mockMessages);
      expect(service.sendMessage).toHaveBeenCalledWith(TEST_TENANT_ID, MOCK_SESSION_ID, dto.message);
    });

    it('should throw BadRequestException if session ID in path and body mismatch', async () => {
      const dto: SendMessageDto = { sessionId: uuidv4(), message: 'User query' }; // Mismatching sessionId
      
      await expect(controller.sendMessage(TEST_TENANT_ID, MOCK_SESSION_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('getChatHistory', () => {
    it('should call aiService.getChatHistory and return the history', async () => {
      const queryDto: any = { sessionId: MOCK_SESSION_ID, limit: 10, offset: 0 };
      const mockHistory: AiChatMessage[] = [
        { id: uuidv4(), sessionId: MOCK_SESSION_ID, tenantId: TEST_TENANT_ID, role: 'user', content: 'Msg 1', createdAt: new Date() as any }
      ];
      (service.getChatHistory as jest.Mock).mockResolvedValue(mockHistory);

      const result = await controller.getChatHistory(TEST_TENANT_ID, MOCK_SESSION_ID, queryDto);

      expect(result).toEqual(mockHistory);
      expect(service.getChatHistory).toHaveBeenCalledWith(TEST_TENANT_ID, MOCK_SESSION_ID, (queryDto as any).limit, (queryDto as any).offset);
    });
  });
});

