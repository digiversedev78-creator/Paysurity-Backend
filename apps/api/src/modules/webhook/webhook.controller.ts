import {
  Controller, Get, Post, Put, Delete, Body, Param,
  HttpCode, HttpStatus, Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { WebhookService } from './webhook.service';

@ApiTags('webhook')
@Controller('v1/webhook')
@ApiBearerAuth('JWT-auth')
export class WebhookController {
  constructor(private readonly service: WebhookService) {}

  @Get()
  @ApiOperation({ summary: 'List all webhook records' })
  async findAll(@Request() req: any) {
    const data = await this.service.findAll(req.user.tenantId);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get webhook by ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    const data = await this.service.findById(id, req.user.tenantId);
    return { data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new webhook' })
  async create(@Body() body: any, @Request() req: any) {
    const data = await this.service.create(req.user.tenantId, body);
    return { data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update webhook' })
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    const data = await this.service.update(id, req.user.tenantId, body);
    return { data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete webhook' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.service.delete(id, req.user.tenantId);
  }
}
