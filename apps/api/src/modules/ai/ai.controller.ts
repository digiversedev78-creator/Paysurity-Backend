/**
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 * PROJECT:      paysurity-platform-2026
 * REQUIREMENT:  AI-002 â€” AI Chat / Virtual Assistant
 * FILE TYPE:    CONTROLLER
 * MODULE:       ai
 * PRIORITY:     P1
 * SOURCE:       Requirements/Canonical/AI_EXPERIENCE.md
 * WORKER:       CODER-196
 * GENERATED:    2026-03-18T10:40:00.841Z
 * MANIFEST:     process.env.MANIFEST_FILE || 'REQUIREMENTS_V5_MANIFEST.json'
 * â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 */
import { Controller, Post, Get, Body, Param, Query, HttpCode, UsePipes, ValidationPipe, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateAiChatSessionDto, SendMessageDto, GetChatHistoryDto } from './ai.dto';
import { AiChatSession, AiChatMessage } from './ai.service'; 
import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

// Custom decorator to extract tenantId from request context.
// In a real application, an AuthGuard/Interceptor would populate request.tenantId.
const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    // In a production environment, this would extract tenantId from the
    // authenticated user's context (e.g., from a JWT payload or session).
    // For local development/testing or if not yet integrated with auth,
    // a placeholder or a header lookup can be used.
    return request.tenantId || 'e17a3a37-9b8e-4a8f-b0c7-2c4f8b0c7c00'; // Example placeholder UUID
  },
);

@Controller('ai/chat')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Starts a new AI chat session for the authenticated tenant.
   * @param tenantId The ID of the tenant (inferred from authentication context).
   * @param _createAiChatSessionDto The DTO for starting a session. Currently empty, can be extended.
   * @returns The created chat session object.
   */
  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async createChatSession(
    @TenantId() tenantId: string,
    @Body() _createAiChatSessionDto: CreateAiChatSessionDto, // DTO kept for future extensibility
  ): Promise<AiChatSession> {
    return (this.aiService as any).createChatSession(tenantId);
  }

  /**
   * Sends a message to a specific AI chat session and retrieves the AI's response.
   * @param tenantId The ID of the tenant.
   * @param sessionId The ID of the chat session.
   * @param sendMessageDto The DTO containing the user's message.
   * @returns An array containing the user's message and the AI's response.
   */
  @Post('sessions/:sessionId/messages')
  @HttpCode(HttpStatus.OK)
  async sendMessage(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<AiChatMessage[]> {
    // Ensure the sessionId in the DTO matches the one in the path for consistency.
    if ((sendMessageDto as any).sessionId && (sendMessageDto as any).sessionId !== sessionId) {
      throw new BadRequestException('Session ID in path and body do not match.');
    }
    return (this.aiService as any).sendMessage(tenantId, sessionId, (sendMessageDto as any).message);
  }

  /**
   * Retrieves the chat history for a specific AI chat session.
   * @param tenantId The ID of the tenant.
   * @param sessionId The ID of the chat session.
   * @param queryDto The DTO for pagination (limit, offset).
   * @returns An array of chat messages in chronological order.
   */
  @Get('sessions/:sessionId/history')
  @HttpCode(HttpStatus.OK)
  async getChatHistory(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
    @Query() queryDto: GetChatHistoryDto,
  ): Promise<AiChatMessage[]> {
    return (this.aiService as any).getChatHistory(tenantId, sessionId, (queryDto as any).limit, (queryDto as any).offset);
  }
}


