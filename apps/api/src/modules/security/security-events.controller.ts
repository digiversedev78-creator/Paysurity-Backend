import { Controller, Get, Param, Query, Patch, Body, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { SecurityEventsService } from './security-events.service';
import { SecurityEventQueryParamsDto } from './dto/security-event-query-params.dto';
import { UpdateSecurityEventStatusDto } from './dto/update-security-event-status.dto';

@ApiTags('Security Events')
@ApiBearerAuth()
@Controller('security-events')
export class SecurityEventsController {
  constructor(private readonly securityEventsService: SecurityEventsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of security events with optional filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of security events successfully retrieved.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination (default: 1).' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10).' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Field to sort by (e.g., timestamp, severity).' })
  @ApiQuery({ name: 'order', required: false, enum: ['ASC', 'DESC'], description: 'Sort order (default: DESC).' })
  @ApiQuery({ name: 'type', required: false, type: [String], description: 'Filter by event type (comma-separated list of types).' })
  @ApiQuery({ name: 'severity', required: false, type: [String], description: 'Filter by severity (comma-separated list of severities: INFO, WARNING, CRITICAL).' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID associated with the event.' })
  @ApiQuery({ name: 'entityId', required: false, type: String, description: 'Filter by entity ID associated with the event.' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter events from this ISO 8601 date.' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter events up to this ISO 8601 date.' })
  async findAll(@Query() query: SecurityEventQueryParamsDto) {
    return (this.securityEventsService as any).findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single security event by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security event successfully retrieved.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Security event not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return (this.securityEventsService as any).findOne(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a security event (e.g., mark as reviewed/resolved)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Security event status successfully updated.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Security event not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status provided.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSecurityEventStatusDto: UpdateSecurityEventStatusDto,
  ) {
    return (this.securityEventsService as any).updateStatus(id, (updateSecurityEventStatusDto as any).status);
  }
}





