import { Controller, Get, Post, Patch, Body, Param, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AIFeedbackService } from './ai-feedback.service';

@ApiTags('AI Feedback')
@Controller('v1/ai/feedback')
export class AIFeedbackController {
  constructor(private readonly feedbackService: AIFeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Log unknown AI intent (public -- called from microsites)' })
  async logFeedback(@Body() body: {
    tenantId: string;
    locationId?: string;
    sessionToken?: string;
    channel?: string;
    consumerMessage: string;
    aiResponse: string;
    detectedIntent?: string;
    languageCode?: string;
  }) {
    const entry = await (this.feedbackService as any).logUnknownIntent(body);
    return { success: true, data: entry };
  }

  @Get()
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI feedback entries for merchant review' })
  async getFeedback(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('intent') intent?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user?.tenantId;
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const result = await (this.feedbackService as any).getFeedback(tenantId, {
      status: status ?? undefined,
      intent: intent ?? undefined,
      limit: parsedLimit,
    });
    return { success: true, data: result };
  }

  @Patch(':id')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'Update feedback resolution status' })
  async updateResolution(
    @Param('id') id: string,
    @Body() body: { resolutionStatus: string; merchantNotes?: string },
  ) {
    const entry = await (this.feedbackService as any).updateResolution(id, body);
    return { success: true, data: entry };
  }

  @Get('analytics')
    @ApiBearerAuth()
  @ApiOperation({ summary: 'AI feedback analytics -- top unknown questions' })
  async getAnalytics(@Request() req: any) {
    const tenantId = req.user?.tenantId;
    const analytics = await (this.feedbackService as any).getAnalytics(tenantId);
    return { success: true, data: analytics };
  }
}

